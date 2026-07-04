import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String
  },
  otpExpiresAt: {
    type: Date
  },
  vehicleModel: {
    type: String,
    default: 'Tata Nexon EV Max'
  },
  batteryCapacity: {
    type: Number,
    default: 40.5 // kWh
  },
  vehicles: {
    type: [
      {
        model: { type: String, required: true },
        capacity: { type: Number, required: true },
        range: { type: Number, default: 350 }
      }
    ],
    default: [
      { model: 'Tata Nexon EV Max', capacity: 40.5, range: 437 }
    ]
  },
  savedLocations: [
    {
      name: String,
      address: String,
      lat: Number,
      lng: Number
    }
  ],
  walletBalance: {
    type: Number,
    default: 70
  },
  plannerCredits: {
    type: Number,
    default: 10
  },
  transactions: {
    type: [
      {
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    default: [
      { amount: 70, description: 'Signup Welcome EV Credits' }
    ]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'User'
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
