import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 600 // Document automatically deleted after 10 mins
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
export default OtpVerification;
