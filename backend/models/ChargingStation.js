import mongoose from 'mongoose';

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  chargerType: {
    type: String,
    enum: ['AC Type 2', 'DC Fast Charger', 'CCS2 Fast Charger', 'CHAdeMO'],
    default: 'DC Fast Charger'
  },
  outputPower: {
    type: Number, // in kW, e.g. 50, 120, 150
    default: 60
  },
  availablePorts: {
    type: Number,
    default: 4
  },
  totalPorts: {
    type: Number,
    default: 4
  },
  pricing: {
    type: Number, // price per kWh in local currency (e.g. INR)
    default: 15
  },
  operatingHours: {
    type: String,
    default: '24/7'
  },
  rating: {
    type: Number,
    default: 4.5
  },
  status: {
    type: String,
    enum: ['Available', 'Busy', 'Offline'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'ChargingStation'
});

const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);
export default ChargingStation;
