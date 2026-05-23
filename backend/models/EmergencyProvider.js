import mongoose from 'mongoose';

const emergencyProviderSchema = new mongoose.Schema({
  providerName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Mobile Charging', 'On-site Service', 'Emergency Towing', 'Tire & Mechanical'],
    default: 'Mobile Charging'
  },
  vehicleInfo: {
    type: String, // e.g., "Tata Ace EV Van - Vehicle ID 12"
    default: 'EV Rescue Van'
  },
  pricing: {
    type: String, // e.g. "₹25/kWh (Min ₹200)"
    default: '₹25/kWh'
  },
  rating: {
    type: Number,
    default: 4.7
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Offline'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'EmergencyProvider'
});

const EmergencyProvider = mongoose.model('EmergencyProvider', emergencyProviderSchema);
export default EmergencyProvider;
