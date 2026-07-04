import express from 'express';
import ImageKit from 'imagekit';
import PaymentVerification from '../models/PaymentVerification.js';
import PaymentSettings from '../models/PaymentSettings.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { notifyAdmins } from '../utils/sendEmail.js';

const router = express.Router();

// Initialize ImageKit SDK
// Uses keys from environment variables, falls back gracefully to default placeholders
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_simulated_key_987654321',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_simulated_key_123456789',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/onwheel_ev_cockpit'
});

// @desc    Get ImageKit.io client signature for direct frontend secure uploads
// @route   GET /api/payments/imagekit-auth
// @access  Private
router.get('/imagekit-auth', protect, (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json({
      success: true,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_simulated_key_987654321',
      ...authenticationParameters
    });
  } catch (error) {
    console.warn('ImageKit client configuration missing or offline, returning simulated sign keys.');
    res.json({
      success: true,
      publicKey: 'public_simulated_key_987654321',
      token: 'simulated_imagekit_upload_token_' + Date.now(),
      expire: Math.floor(Date.now() / 1000) + 3600,
      signature: 'simulated_imagekit_secure_crypto_hash_signature_value'
    });
  }
});

// @desc    Submit a manual UPI/QR payment verification screenshot & UTR number
// @route   POST /api/payments/verify-submit
// @access  Private
router.post('/verify-submit', protect, async (req, res) => {
  const { amount, paymentMethod, upiIdUsed, utr, screenshotUrl } = req.body;

  if (!amount || !paymentMethod || !utr || !screenshotUrl) {
    return res.status(400).json({ success: false, message: 'Please provide amount, payment method, 12-digit UTR, and screenshot URL' });
  }

  // Validate UTR is exactly 12 digits
  if (!/^\d{12}$/.test(utr)) {
    return res.status(400).json({ success: false, message: 'UTR must be exactly 12 digits (numeric characters only).' });
  }

  try {
    // Check if UTR is already used (must be globally unique)
    const existingPayment = await PaymentVerification.findOne({ utr });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'This UTR number has already been submitted. Every payment transaction must have a unique UTR.' });
    }

    const verification = await PaymentVerification.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      amount: parseFloat(amount),
      paymentMethod,
      upiIdUsed: paymentMethod === 'upi' ? upiIdUsed : undefined,
      utr,
      screenshotUrl
    });

    // Trigger notification to admin
    notifyAdmins(
      `OnWheel EV Payment: Manual Verification Pending - ${req.user.name}`,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
         <h2>Manual Payment Verification Pending</h2>
         <p><strong>User:</strong> ${req.user.name} (${req.user.email})</p>
         <p><strong>Amount:</strong> ₹${parseFloat(amount)}</p>
         <p><strong>Method:</strong> ${paymentMethod.toUpperCase()}</p>
         <p><strong>UTR:</strong> ${utr}</p>
         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
         <p><a href="${screenshotUrl}" target="_blank" style="color: #00f5d4; font-weight: bold;">View Screenshot</a></p>
       </div>`
    );

    res.status(201).json({
      success: true,
      message: 'Payment verification screenshot and UTR submitted successfully! Pending admin approval.',
      verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user's own submitted payment verifications
// @route   GET /api/payments/my-requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const verifications = await PaymentVerification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all pending verifications for administrators review
// @route   GET /api/payments/admin/requests
// @access  Private/Admin
router.get('/admin/requests', protect, adminOnly, async (req, res) => {
  try {
    const verifications = await PaymentVerification.find({ status: 'pending' }).sort({ createdAt: 1 });
    res.json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Approve or Reject a pending payment verification
// @route   POST /api/payments/admin/resolve/:id
// @access  Private/Admin
router.post('/admin/resolve/:id', protect, adminOnly, async (req, res) => {
  const { status, adminNotes } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid resolution status (approved or rejected)' });
  }

  try {
    const verification = await PaymentVerification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Payment verification record not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This transaction has already been resolved as: ${verification.status}` });
    }

    verification.status = status;
    verification.adminNotes = adminNotes || '';
    await verification.save();

    // If approved, update user's walletBalance and append to transaction ledger
    if (status === 'approved') {
      const user = await User.findById(verification.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User associated with this payment not found' });
      }

      user.walletBalance = (user.walletBalance || 0) + verification.amount;

      if (!user.transactions) {
        user.transactions = [];
      }

      user.transactions.push({
        amount: verification.amount,
        description: `CyberPass Wallet manual refill approved via ${verification.paymentMethod.toUpperCase()} (UTR: ${verification.utr})`
      });

      await user.save();
    }

    res.json({
      success: true,
      message: `Transaction has been successfully resolved as: ${status.toUpperCase()}`,
      verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get global payment settings (UPI ID & QR Code Image)
// @route   GET /api/payments/settings
// @access  Public (or Private)
router.get('/settings', async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      // Seed initial default configurations
      settings = await PaymentSettings.create({
        upiId: 'charge@onwheel',
        qrCodeUrl: 'https://ik.imagekit.io/bozyne2hl/subnova/simulated_qr_code.png'
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update global payment settings configuration
// @route   POST /api/payments/settings
// @access  Private/Admin
router.post('/settings', protect, adminOnly, async (req, res) => {
  const { upiId, qrCodeUrl } = req.body;

  if (!upiId || !qrCodeUrl) {
    return res.status(400).json({ success: false, message: 'Please provide both UPI ID and QR Code image URL.' });
  }

  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings({ upiId, qrCodeUrl, updatedBy: req.user.name });
    } else {
      settings.upiId = upiId;
      settings.qrCodeUrl = qrCodeUrl;
      settings.updatedBy = req.user.name;
    }
    await settings.save();

    res.json({
      success: true,
      message: 'Global payment configuration settings successfully updated!',
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
