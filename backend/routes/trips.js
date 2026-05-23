import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TripHistory from '../models/TripHistory.js';
import ChargingStation from '../models/ChargingStation.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Preset configurations for EV Models
const EV_MODELS = {
  'Tesla Model 3': { capacity: 60, consumption: 140 }, // Wh/km
  'Tata Nexon EV Max': { capacity: 40.5, consumption: 150 },
  'MG ZS EV': { capacity: 50.3, consumption: 160 },
  'Hyundai Ioniq 5': { capacity: 72.6, consumption: 170 },
  'Ather 450X (2-Wheeler)': { capacity: 3.7, consumption: 30 }
};

// Route presets for high-fidelity matches (matching mockups perfectly)
const ROUTE_PRESETS = [
  {
    source: 'hyderabad',
    destination: 'bengaluru',
    distance: 565,
    duration: '9 h 45 m',
    stops: [
      {
        name: 'Rameji Fast Charging Station',
        address: 'NH44 Highway, Kurnool Sector 4, Andhra Pradesh - 518002',
        chargerType: '150 kW DC Charger',
        outputPower: 150,
        chargeDurationMinutes: 20,
        chargePercentageGained: 60, // 20% to 80%
        distanceFromStart: 165,
        lat: 15.8281, // Kurnool area
        lng: 78.0373
      },
      {
        name: 'Evolve Charge Station',
        address: 'NH44 Bypass Road, Near Evolve Tech Center, Anantapur, Andhra Pradesh - 515001',
        chargerType: '120 kW DC Charger',
        outputPower: 120,
        chargeDurationMinutes: 15,
        chargePercentageGained: 50, // 20% to 70%
        distanceFromStart: 360,
        lat: 14.6819, // Anantapur area
        lng: 77.6006
      }
    ]
  },
  {
    source: 'hyderabad',
    destination: 'vijayawada',
    distance: 275,
    duration: '5 h 15 m',
    stops: [
      {
        name: 'Suryapet Highway Grid Charge',
        address: 'NH65 Bypass Road, Near Suryapet Toll Gates, Suryapet, Telangana - 508213',
        chargerType: '60 kW DC Charger',
        outputPower: 60,
        chargeDurationMinutes: 25,
        chargePercentageGained: 40,
        distanceFromStart: 130,
        lat: 17.1439,
        lng: 79.6238
      }
    ]
  },
  {
    source: 'hyderabad',
    destination: 'warangal',
    distance: 148,
    duration: '3 h 0 m',
    stops: []
  }
];

// @desc    Calculate trip recommendations and battery performance
// @route   POST /api/trips/plan
// @access  Public
router.post('/plan', async (req, res) => {
  const { source, destination, startBattery, vehicleModel, sourceCoords, destCoords } = req.body;

  if (!source || !destination || startBattery === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide source, destination, and starting battery status' });
  }

  try {
    // 1. Optional Auth & Premium Credits Verification
    let user = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'onwheel_ev_jwt_secret_cyber_security_key_987654321');
        user = await User.findById(decoded.id);
      } catch (err) {
        console.warn('Optional JWT verification failed in plan route:', err.message);
      }
    }

    if (user) {
      const currentCredits = user.plannerCredits !== undefined ? user.plannerCredits : 10;
      if (currentCredits <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have run out of premium API intelligence tokens. Please refill them from your dashboard Wallet to continue planning trips.' 
        });
      }
    }

    const srcLower = source.toLowerCase();
    const destLower = destination.toLowerCase();

    // Check if preset route exists
    let matchedRoute = ROUTE_PRESETS.find(
      r => (srcLower.includes(r.source) && destLower.includes(r.destination)) || 
           (destLower.includes(r.source) && srcLower.includes(r.destination))
    );

    // Default to dynamic route generation if not matched
    let distance = matchedRoute ? matchedRoute.distance : 250; // default km
    let duration = matchedRoute ? matchedRoute.duration : '4 h 30 m';
    let suggestedStops = matchedRoute ? [...matchedRoute.stops] : [];

    // Calculate real Haversine distance and driving duration for custom coordinates
    if (!matchedRoute && sourceCoords && destCoords) {
      const R = 6371; // Earth radius in km
      const dLat = (destCoords.lat - sourceCoords.lat) * Math.PI / 180;
      const dLon = (destCoords.lng - sourceCoords.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(sourceCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const haversineDist = Math.round(R * c);
      
      // Road routes are typically 1.25x to 1.35x crow-fly distance
      distance = Math.round(haversineDist * 1.3);
      
      // Estimate travel duration (average 65 km/h)
      const hours = Math.floor(distance / 65);
      const minutes = Math.round(((distance % 65) / 65) * 60);
      duration = hours > 0 ? `${hours} h ${minutes} m` : `${minutes} m`;
    }

    const evConfig = EV_MODELS[vehicleModel] || EV_MODELS['Tata Nexon EV Max'];
    const capacityKWh = evConfig.capacity;
    const rateWhPerKm = evConfig.consumption;

    // Battery simulation logic
    const totalEnergyRequired = (distance * rateWhPerKm) / 1000; // in kWh
    const startEnergy = (startBattery / 100) * capacityKWh;

    let computedStops = [];
    
    if (matchedRoute) {
      // Use matched preset but recalculate battery transitions based on custom starting battery
      let tempBattery = startBattery;
      let accumulatedDistance = 0;
      
      for (let i = 0; i < suggestedStops.length; i++) {
        const stop = suggestedStops[i];
        const segDist = stop.distanceFromStart - accumulatedDistance;
        const segEnergyUsed = (segDist * rateWhPerKm) / 1000;
        const segBatteryDrop = (segEnergyUsed / capacityKWh) * 100;
        
        tempBattery = Math.max(5, Math.round(tempBattery - segBatteryDrop));
        
        // Simulating standard stop charging
        const startingChargeAtStop = tempBattery;
        const finalChargeAtStop = Math.min(85, Math.max(tempBattery + 40, 75));
        const chargeGained = finalChargeAtStop - startingChargeAtStop;
        
        tempBattery = finalChargeAtStop;
        accumulatedDistance = stop.distanceFromStart;

        computedStops.push({
          ...stop,
          startingChargeAtStop,
          finalChargeAtStop,
          chargeGained
        });
      }

      // Final segment calculation
      const finalSegDist = distance - accumulatedDistance;
      const finalSegEnergyUsed = (finalSegDist * rateWhPerKm) / 1000;
      const finalSegBatteryDrop = (finalSegEnergyUsed / capacityKWh) * 100;
      const arrivalBattery = Math.max(3, Math.round(tempBattery - finalSegBatteryDrop));

      // Decrement user plannerCredits
      let remainingCredits = 10;
      if (user) {
        user.plannerCredits = Math.max(0, (user.plannerCredits !== undefined ? user.plannerCredits : 10) - 1);
        await user.save();
        remainingCredits = user.plannerCredits;
      }

      return res.json({
        success: true,
        summary: {
          totalDistance: distance,
          duration,
          vehicleModel,
          startBattery,
          arrivalBattery,
          stopsCount: computedStops.length,
          energyConsumedKWh: totalEnergyRequired.toFixed(1),
          carbonSavedKg: (distance * 0.12).toFixed(1),
          plannerCredits: remainingCredits
        },
        suggestedStops: computedStops
      });
    }

    // Procedural generation if no route presets match
    // Suggest charging stops every 150 km if battery goes below 25%
    let segments = Math.ceil(distance / 150);
    let tempBattery = startBattery;
    
    const sCoords = sourceCoords || { lat: 17.3850, lng: 78.4867 };
    const dCoords = destCoords || { lat: 12.9716, lng: 77.5946 };
    
    for (let i = 1; i < segments; i++) {
      const stopDist = i * 150;
      const segEnergyUsed = (150 * rateWhPerKm) / 1000;
      const segBatteryDrop = (segEnergyUsed / capacityKWh) * 100;
      
      tempBattery = Math.max(5, tempBattery - segBatteryDrop);

      if (tempBattery < 25) {
        // Suggest a stop
        const startingChargeAtStop = Math.round(tempBattery);
        const finalChargeAtStop = 80;
        const chargeGained = finalChargeAtStop - startingChargeAtStop;
        
        tempBattery = finalChargeAtStop;

        // Linearly interpolate stop coordinates based on stopDist fraction
        const fraction = stopDist / distance;
        const stopLat = sCoords.lat + (dCoords.lat - sCoords.lat) * fraction;
        const stopLng = sCoords.lng + (dCoords.lng - sCoords.lng) * fraction;

        const srcNameClean = source.split(',')[0].trim();
        const destNameClean = destination.split(',')[0].trim();

        computedStops.push({
          name: `${srcNameClean} - ${destNameClean} PowerGrid #${i}`,
          address: `National Highway Route, Segment Sector ${i}, near ${srcNameClean}-${destNameClean} Corridor`,
          chargerType: '60 kW DC Charger',
          outputPower: 60,
          chargeDurationMinutes: Math.round((chargeGained * capacityKWh * 60) / (60 * 100)),
          chargePercentageGained: chargeGained,
          startingChargeAtStop,
          finalChargeAtStop,
          distanceFromStart: stopDist,
          lat: parseFloat(stopLat.toFixed(5)),
          lng: parseFloat(stopLng.toFixed(5))
        });
      }
    }

    const lastSegDist = distance - (computedStops.length > 0 ? computedStops[computedStops.length - 1].distanceFromStart : 0);
    const lastSegEnergy = (lastSegDist * rateWhPerKm) / 1000;
    const lastSegDrop = (lastSegEnergy / capacityKWh) * 100;
    const arrivalBattery = Math.max(2, Math.round(tempBattery - lastSegDrop));

    // Decrement user plannerCredits
    let remainingCredits = 10;
    if (user) {
      user.plannerCredits = Math.max(0, (user.plannerCredits !== undefined ? user.plannerCredits : 10) - 1);
      await user.save();
      remainingCredits = user.plannerCredits;
    }

    res.json({
      success: true,
      summary: {
        totalDistance: distance,
        duration,
        vehicleModel,
        startBattery,
        arrivalBattery,
        stopsCount: computedStops.length,
        energyConsumedKWh: totalEnergyRequired.toFixed(1),
        carbonSavedKg: (distance * 0.12).toFixed(1),
        plannerCredits: remainingCredits
      },
      suggestedStops: computedStops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Save a trip plan to user history
// @route   POST /api/trips/save
// @access  Private
router.post('/save', protect, async (req, res) => {
  const { sourceName, destName, startBattery, endBattery, totalDistance, duration, suggestedStops } = req.body;

  try {
    const trip = await TripHistory.create({
      userId: req.user._id,
      sourceName,
      destName,
      startBattery,
      endBattery,
      totalDistance,
      duration,
      suggestedStops
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user's trip history
// @route   GET /api/trips/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const trips = await TripHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get trip analytics dashboard metrics
// @route   GET /api/trips/analytics
// @access  Private/Admin
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const tripsCount = await TripHistory.countDocuments({});
    
    // Aggregate aggregate distance
    const totalStats = await TripHistory.aggregate([
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$totalDistance' },
          totalTrips: { $sum: 1 }
        }
      }
    ]);

    const distanceCovered = totalStats.length > 0 ? totalStats[0].totalDistance : 5420; // Default mockup placeholder
    const carbonSaved = (distanceCovered * 0.12).toFixed(0); // in kg
    const totalSpent = (distanceCovered * 1.55).toFixed(0); // Approximate INR costing metric

    res.json({
      success: true,
      metrics: {
        totalTrips: tripsCount > 0 ? tripsCount : 24,
        distanceCovered,
        carbonSaved,
        totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a trip history entry
// @route   DELETE /api/trips/history/:tripId
// @access  Private
router.delete('/history/:tripId', protect, async (req, res) => {
  try {
    const trip = await TripHistory.findOne({ _id: req.params.tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip history entry not found or unauthorized' });
    }
    await trip.deleteOne();
    res.json({ success: true, message: 'Trip history entry removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
