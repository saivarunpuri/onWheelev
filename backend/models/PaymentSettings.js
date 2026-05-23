import mongoose from 'mongoose';

const PaymentSettingsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    required: true,
    default: 'charge@onwheel'
  },
  qrCodeUrl: {
    type: String,
    required: true,
    // default premium styled fallback QR code
    default: 'https://ik.imagekit.io/bozyne2hl/subnova/simulated_qr_code.png'
  },
  updatedBy: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

// Ensure only one setting document exists
PaymentSettingsSchema.pre('save', async function (next) {
  const count = await this.constructor.countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Only one global payment settings configuration can exist.');
  }
  next();
});

const PaymentSettings = mongoose.model('PaymentSettings', PaymentSettingsSchema);
export default PaymentSettings;
