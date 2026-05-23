import express from 'express';
import EmergencyProvider from '../models/EmergencyProvider.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get nearby emergency charging providers
// @route   GET /api/providers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, serviceType } = req.query;
    let query = {};

    if (status) {
      query.availability = status;
    }
    if (serviceType) {
      query.serviceType = serviceType;
    }

    const providers = await EmergencyProvider.find(query);
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get provider by ID
// @route   GET /api/providers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const provider = await EmergencyProvider.findById(req.params.id);
    if (provider) {
      res.json({ success: true, provider });
    } else {
      res.status(404).json({ success: false, message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add an emergency provider
// @route   POST /api/providers
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { providerName, contactNumber, serviceType, vehicleInfo, pricing, rating, lat, lng, availability } = req.body;

  try {
    const provider = await EmergencyProvider.create({
      providerName,
      contactNumber,
      serviceType,
      vehicleInfo,
      pricing,
      rating,
      lat,
      lng,
      availability
    });

    res.status(201).json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update provider details
// @route   PUT /api/providers/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const provider = await EmergencyProvider.findById(req.params.id);

    if (provider) {
      provider.providerName = req.body.providerName || provider.providerName;
      provider.contactNumber = req.body.contactNumber || provider.contactNumber;
      provider.serviceType = req.body.serviceType || provider.serviceType;
      provider.vehicleInfo = req.body.vehicleInfo || provider.vehicleInfo;
      provider.pricing = req.body.pricing !== undefined ? req.body.pricing : provider.pricing;
      provider.rating = req.body.rating !== undefined ? req.body.rating : provider.rating;
      provider.lat = req.body.lat !== undefined ? req.body.lat : provider.lat;
      provider.lng = req.body.lng !== undefined ? req.body.lng : provider.lng;
      provider.availability = req.body.availability || provider.availability;

      const updatedProvider = await provider.save();
      res.json({ success: true, provider: updatedProvider });
    } else {
      res.status(404).json({ success: false, message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete provider
// @route   DELETE /api/providers/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const provider = await EmergencyProvider.findById(req.params.id);
    if (provider) {
      await provider.deleteOne();
      res.json({ success: true, message: 'Provider removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Request emergency provider (Dispatch Simulation)
// @route   POST /api/providers/:id/request
// @access  Private
router.post('/:id/request', protect, async (req, res) => {
  try {
    const provider = await EmergencyProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (provider.availability === 'Busy') {
      return res.status(400).json({ success: false, message: 'Provider is currently busy assisting another driver' });
    }

    // Set provider status to busy
    provider.availability = 'Busy';
    await provider.save();

    // Generate random dispatch metadata for tracking
    const trackingId = Math.random().toString(36).substring(2, 11).toUpperCase();
    
    res.json({
      success: true,
      message: `Emergency charging vehicle '${provider.providerName}' has been dispatched!`,
      dispatch: {
        trackingId,
        provider: {
          _id: provider._id,
          providerName: provider.providerName,
          contactNumber: provider.contactNumber,
          vehicleInfo: provider.vehicleInfo,
          serviceType: provider.serviceType,
          rating: provider.rating,
          lat: provider.lat,
          lng: provider.lng
        },
        etaMinutes: 15,
        distanceKm: 4.2,
        status: 'En Route'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
