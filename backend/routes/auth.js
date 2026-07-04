import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OtpVerification from '../models/OtpVerification.js';
import { protect, adminOnly } from '../middleware/auth.js';
import sendEmail, { notifyAdmins } from '../utils/sendEmail.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'onwheel_ev_jwt_secret_cyber_security_key_987654321', {
    expiresIn: '30d'
  });
};

const serializeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    vehicleModel: user.vehicleModel,
    batteryCapacity: user.batteryCapacity,
    role: user.role,
    savedLocations: user.savedLocations || [],
    vehicles: user.vehicles || [],
    walletBalance: user.walletBalance,
    plannerCredits: user.plannerCredits !== undefined ? user.plannerCredits : 10,
    transactions: user.transactions || []
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, username, email, password, vehicleModel, batteryCapacity, otp } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
    }

    // Verify OTP
    const otpRecord = await OtpVerification.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      vehicleModel,
      batteryCapacity,
      vehicles: [{ model: vehicleModel, capacity: batteryCapacity }]
    });

    await OtpVerification.deleteOne({ email });

    // Send welcome email to user
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to OnWheel EV!',
        htmlContent: `
          <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background-color: #0b0c10; padding: 40px; border-radius: 16px; border: 1px solid #1f2937; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4ade80; margin: 0; font-size: 28px; letter-spacing: -0.5px;">OnWheel <span style="color: #ffffff;">EV</span></h1>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Smart Trip Core</p>
            </div>
            
            <div style="background-color: #121212; border: 1px solid #374151; padding: 30px; border-radius: 12px; text-align: center;">
              <h2 style="margin-top: 0; color: #ffffff; font-size: 18px; font-weight: 500;">Welcome, ${user.name}!</h2>
              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 25px;">Your OnWheel EV account has been successfully created. We are excited to help you plan smart trips and locate EV charging coordinates dynamically.</p>
              
              <div style="background-color: #000000; padding: 15px; border-radius: 8px; border: 1px solid #4ade80; text-align: left;">
                <p style="margin: 5px 0; color: #ffffff; font-size: 13px;"><strong>Username:</strong> ${user.username}</p>
                <p style="margin: 5px 0; color: #ffffff; font-size: 13px;"><strong>Vehicle Model:</strong> ${user.vehicleModel}</p>
                <p style="margin: 5px 0; color: #ffffff; font-size: 13px;"><strong>Battery Capacity:</strong> ${user.batteryCapacity} kWh</p>
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 11px; text-align: center; margin-top: 30px;">
              &copy; ${new Date().getFullYear()} OnWheel EV Systems. All rights reserved.
            </p>
          </div>
        `
      });
      console.log(`Welcome email sent to: ${user.email}`);
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr.message);
    }

    // Trigger notification to admin
    notifyAdmins(
      `OnWheel EV Alert: New Registration - ${user.name}`,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
         <h2>New User Registered</h2>
         <p><strong>Name:</strong> ${user.name}</p>
         <p><strong>Username:</strong> ${user.username}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Vehicle Model:</strong> ${user.vehicleModel}</p>
         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
       </div>`
    );

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', async (req, res) => {
  const { email, intent } = req.body; // intent: 'login' or 'register'

  try {
    const userExists = await User.findOne({ email });

    if (intent === 'register' && userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    if (intent === 'login' && !userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send real-time email
    try {
      await sendEmail({
        email: email,
        subject: 'Your OnWheel EV Verification Code',
        otp: otp
      });
      console.log(`Live OTP sent via SMTP to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError.message);
      // Return the specific error message to help with debugging
      return res.status(500).json({ success: false, message: `Failed to send OTP email: ${emailError.message}` });
    }

    if (intent === 'register') {
      await OtpVerification.findOneAndUpdate(
        { email },
        { otp, expiresAt },
        { upsert: true, new: true }
      );
    } else {
      userExists.otp = otp;
      userExists.otpExpiresAt = expiresAt;
      await userExists.save();
    }

    res.json({ success: true, message: 'OTP sent successfully', _simulatedOtp: otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auth user with OTP & get token
// @route   POST /api/auth/login-otp
// @access  Public
router.post('/login-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Trigger notification to admin
    notifyAdmins(
      `OnWheel EV Alert: Login - ${user.name}`,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
         <h2>User Login Notification</h2>
         <p><strong>Name:</strong> ${user.name}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Method:</strong> OTP Authentication</p>
         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
       </div>`
    );

    res.json({
      success: true,
      token: generateToken(user._id),
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      // Trigger notification to admin
      notifyAdmins(
        `OnWheel EV Alert: Login - ${user.name}`,
        `<div style="font-family: sans-serif; padding: 20px; color: #333;">
           <h2>User Login Notification</h2>
           <p><strong>Name:</strong> ${user.name}</p>
           <p><strong>Email:</strong> ${user.email}</p>
           <p><strong>Method:</strong> Password Authentication</p>
           <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
         </div>`
      );

      res.json({
        success: true,
        token: generateToken(user._id),
        user: serializeUser(user)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        user: serializeUser(user)
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.vehicleModel = req.body.vehicleModel || user.vehicleModel;
      user.batteryCapacity = req.body.batteryCapacity || user.batteryCapacity;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.savedLocations) {
        user.savedLocations = req.body.savedLocations;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        token: generateToken(updatedUser._id),
        user: serializeUser(updatedUser)
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
      }
      await user.deleteOne();
      res.json({ success: true, message: 'User removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add a new vehicle configuration
// @route   POST /api/auth/profile/vehicles
// @access  Private
router.post('/profile/vehicles', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { model, capacity, range } = req.body;
    if (!model || !capacity) {
      return res.status(400).json({ success: false, message: 'Model and battery capacity are required' });
    }

    const newVehicle = {
      model,
      capacity: parseFloat(capacity),
      range: range ? parseFloat(range) : Math.round(parseFloat(capacity) * 9.5)
    };

    if (!user.vehicles) {
      user.vehicles = [];
    }

    user.vehicles.push(newVehicle);

    // If there is only one vehicle, make it the default active one
    if (user.vehicles.length === 1) {
      user.vehicleModel = model;
      user.batteryCapacity = parseFloat(capacity);
    }

    await user.save();

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a vehicle configuration
// @route   PUT /api/auth/profile/vehicles/:vehicleId
// @access  Private
router.put('/profile/vehicles/:vehicleId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicle = user.vehicles.id(req.params.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found in garage' });
    }

    const { model, capacity, range } = req.body;
    const oldModel = vehicle.model;

    if (model) vehicle.model = model;
    if (capacity) vehicle.capacity = parseFloat(capacity);
    if (range) {
      vehicle.range = parseFloat(range);
    } else if (capacity) {
      vehicle.range = Math.round(parseFloat(capacity) * 9.5);
    }

    // If this vehicle was the active/default one, update the user profile active fields!
    if (user.vehicleModel === oldModel) {
      user.vehicleModel = vehicle.model;
      user.batteryCapacity = vehicle.capacity;
    }

    await user.save();

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a vehicle configuration
// @route   DELETE /api/auth/profile/vehicles/:vehicleId
// @access  Private
router.delete('/profile/vehicles/:vehicleId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicleIndex = user.vehicles.findIndex(v => v._id.toString() === req.params.vehicleId);
    if (vehicleIndex === -1) {
      return res.status(404).json({ success: false, message: 'Vehicle not found in garage' });
    }

    const deletedVehicle = user.vehicles[vehicleIndex];
    user.vehicles.splice(vehicleIndex, 1);

    // If deleted vehicle was the active one, fallback to first available or reset
    if (user.vehicleModel === deletedVehicle.model) {
      if (user.vehicles.length > 0) {
        user.vehicleModel = user.vehicles[0].model;
        user.batteryCapacity = user.vehicles[0].capacity;
      } else {
        user.vehicleModel = 'Tata Nexon EV Max';
        user.batteryCapacity = 40.5;
      }
    }

    await user.save();

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Set vehicle as active/default
// @route   POST /api/auth/profile/vehicles/:vehicleId/select
// @access  Private
router.post('/profile/vehicles/:vehicleId/select', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicle = user.vehicles.id(req.params.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found in garage' });
    }

    user.vehicleModel = vehicle.model;
    user.batteryCapacity = vehicle.capacity;

    await user.save();

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add a saved location
// @route   POST /api/auth/profile/locations
// @access  Private
router.post('/profile/locations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const { name, address, lat, lng } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Location name and address are required' });
    }

    const newLoc = {
      name,
      address,
      lat: lat ? parseFloat(lat) : 17.44,
      lng: lng ? parseFloat(lng) : 78.39
    };

    if (!user.savedLocations) {
      user.savedLocations = [];
    }

    user.savedLocations.push(newLoc);
    await user.save();
    
    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a saved location
// @route   DELETE /api/auth/profile/locations/:locId
// @access  Private
router.delete('/profile/locations/:locId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.savedLocations = user.savedLocations.filter(loc => loc._id.toString() !== req.params.locId);
    await user.save();
    
    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Refill wallet credits
// @route   POST /api/auth/profile/wallet/refill
// @access  Private
router.post('/profile/wallet/refill', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid refill amount' });
    }
    
    user.walletBalance = (user.walletBalance || 0) + parseFloat(amount);
    
    if (!user.transactions) {
      user.transactions = [];
    }

    user.transactions.push({
      amount: parseFloat(amount),
      description: `Refilled virtual wallet via CyberCard`
    });
    
    await user.save();

    // Trigger notification to admin
    notifyAdmins(
      `OnWheel EV Payment: Wallet Refill - ${user.name}`,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
         <h2>User Wallet Refill Notification</h2>
         <p><strong>Name:</strong> ${user.name}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Refill Amount:</strong> ₹${parseFloat(amount)}</p>
         <p><strong>Payment Method:</strong> CyberCard</p>
         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
       </div>`
    );
    
    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Make EV grid energy payment
// @route   POST /api/auth/profile/wallet/pay
// @access  Private
router.post('/profile/wallet/pay', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const { amount, description } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }
    
    if ((user.walletBalance || 0) < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet credits. Please refill your CyberPass.' });
    }
    
    user.walletBalance = (user.walletBalance || 0) - parseFloat(amount);
    
    if (!user.transactions) {
      user.transactions = [];
    }

    user.transactions.push({
      amount: -parseFloat(amount),
      description: description || 'EV Charging Session Billing'
    });
    
    await user.save();

    // Trigger notification to admin
    notifyAdmins(
      `OnWheel EV Payment: Charging Billing - ${user.name}`,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
         <h2>User Grid Energy Payment Notification</h2>
         <p><strong>Name:</strong> ${user.name}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Charged Amount:</strong> ₹${parseFloat(amount)}</p>
         <p><strong>Description:</strong> ${description || 'EV Charging Session Billing'}</p>
         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
       </div>`
    );
    
    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Refill premium planner credits using wallet balance (dynamic bundle support)
// @route   POST /api/auth/profile/planner/refill
// @access  Private
router.post('/profile/planner/refill', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { tokens, cost } = req.body;
    const tokenQty = tokens ? parseInt(tokens) : 10;
    const tokenCost = cost ? parseFloat(cost) : 100;

    if ((user.walletBalance || 0) < tokenCost) {
      return res.status(400).json({ success: false, message: `Insufficient wallet credits. Refill your CyberPass with at least ₹${tokenCost} credits.` });
    }

    user.walletBalance = (user.walletBalance || 0) - tokenCost;
    user.plannerCredits = (user.plannerCredits || 0) + tokenQty;

    if (!user.transactions) {
      user.transactions = [];
    }

    user.transactions.push({
      amount: -tokenCost,
      description: `Purchased ${tokenQty} Premium Route Planner Tokens`
    });

    await user.save();

    // Trigger notification to admin
    notifyAdmins(
      `OnWheel EV Payment: Token Refill - ${user.name}`,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
         <h2>User Token Purchase Notification</h2>
         <p><strong>Name:</strong> ${user.name}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Tokens Purchased:</strong> ${tokenQty} ⚡</p>
         <p><strong>Cost Deducted:</strong> ₹${tokenCost}</p>
         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
       </div>`
    );

    res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
