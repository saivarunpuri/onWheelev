import mongoose from 'mongoose';

const tripHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourceName: {
    type: String,
    required: true
  },
  destName: {
    type: String,
    required: true
  },
  sourceLat: Number,
  sourceLng: Number,
  destLat: Number,
  destLng: Number,
  startBattery: {
    type: Number,
    required: true
  },
  endBattery: {
    type: Number,
    required: true
  },
  totalDistance: {
    type: Number, // in km
    required: true
  },
  duration: {
    type: String, // e.g. "9 h 45 m"
    required: true
  },
  suggestedStops: [
    {
      stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChargingStation'
      },
      name: String,
      address: String,
      chargerType: String,
      outputPower: Number,
      chargeDurationMinutes: Number,
      chargePercentageGained: Number,
      distanceFromStart: Number
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'TripHistory'
});

const TripHistory = mongoose.model('TripHistory', tripHistorySchema);
export default TripHistory;
