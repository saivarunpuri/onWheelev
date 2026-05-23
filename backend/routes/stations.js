import express from 'express';
import ChargingStation from '../models/ChargingStation.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all charging stations
// @route   GET /api/stations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, chargerType, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (chargerType) {
      query.chargerType = chargerType;
    }
    if (status) {
      query.status = status;
    }

    const stations = await ChargingStation.find(query);
    res.json({ success: true, stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get charging station by ID
// @route   GET /api/stations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (station) {
      res.json({ success: true, station });
    } else {
      res.status(404).json({ success: false, message: 'Charging station not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new charging station
// @route   POST /api/stations
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, address, lat, lng, chargerType, outputPower, availablePorts, totalPorts, pricing, operatingHours, rating, status } = req.body;

  try {
    const station = await ChargingStation.create({
      name,
      address,
      lat,
      lng,
      chargerType,
      outputPower,
      availablePorts: availablePorts || totalPorts,
      totalPorts,
      pricing,
      operatingHours,
      rating,
      status
    });

    res.status(201).json({ success: true, station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a charging station
// @route   PUT /api/stations/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);

    if (station) {
      station.name = req.body.name || station.name;
      station.address = req.body.address || station.address;
      station.lat = req.body.lat !== undefined ? req.body.lat : station.lat;
      station.lng = req.body.lng !== undefined ? req.body.lng : station.lng;
      station.chargerType = req.body.chargerType || station.chargerType;
      station.outputPower = req.body.outputPower !== undefined ? req.body.outputPower : station.outputPower;
      station.availablePorts = req.body.availablePorts !== undefined ? req.body.availablePorts : station.availablePorts;
      station.totalPorts = req.body.totalPorts !== undefined ? req.body.totalPorts : station.totalPorts;
      station.pricing = req.body.pricing !== undefined ? req.body.pricing : station.pricing;
      station.operatingHours = req.body.operatingHours || station.operatingHours;
      station.rating = req.body.rating !== undefined ? req.body.rating : station.rating;
      station.status = req.body.status || station.status;

      const updatedStation = await station.save();
      res.json({ success: true, station: updatedStation });
    } else {
      res.status(404).json({ success: false, message: 'Charging station not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a charging station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (station) {
      await station.deleteOne();
      res.json({ success: true, message: 'Charging station removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Charging station not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
