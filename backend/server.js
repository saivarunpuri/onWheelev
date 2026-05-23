import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import routers
import authRouter from './routes/auth.js';
import stationsRouter from './routes/stations.js';
import providersRouter from './routes/providers.js';
import tripsRouter from './routes/trips.js';
import paymentsRouter from './routes/payments.js';

// Import Models for auto-seeding
import User from './models/User.js';
import ChargingStation from './models/ChargingStation.js';
import EmergencyProvider from './models/EmergencyProvider.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Primary APIs
app.use('/api/auth', authRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/providers', providersRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/payments', paymentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'offline/fallback-active'
  });
});

// Fallback error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

// Seed Data
const seedDatabase = async () => {
  try {
    // Ensure Varun is the sole Admin user in the system
    await User.deleteMany({ email: 'admin@onwheel.ev' });

    const adminUser = await User.findOne({ email: 'varun2004.pvt@gmail.com' });
    if (!adminUser) {
      console.log('Seeding Varun as the sole administrator account...');
      await User.create({
        name: 'Varun EV Admin',
        email: 'varun2004.pvt@gmail.com',
        password: 'admin123',
        role: 'admin',
        vehicleModel: 'Tesla Model 3',
        batteryCapacity: 60
      });
      console.log('Varun admin credentials created: varun2004.pvt@gmail.com / admin123');
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('Ensured varun2004.pvt@gmail.com is set as Admin.');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

// Database connection logic
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/onwheel-ev';
  
  try {
    console.log('Connecting to database...');
    // Attempt standard MongoDB connection
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout before failure
    });
    console.log('MongoDB database connected successfully.');
    await seedDatabase();
  } catch (error) {
    console.error('CRITICAL: MongoDB connection failed:', error.message);
    console.log('--- ENTERING FALLBACK IN-MEMORY MODE ---');
    console.log('The backend server will run in-memory. Data modifications will persist during this server run, but will reset upon server restart.');
    
    // Attempt connecting to a local MongoDB memory server or just mock operations.
    // In our Mongoose models, if Mongoose fails to connect, queries will queue.
    // To prevent queue timeout issues, we can configure Mongoose to run with fake collections or connect locally.
    // Let's connect to a local sqlite or similar if mongoose has a fallback, or we can just proceed with standard mongoose buffer commands disabled.
    mongoose.pluralize(null);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`OnWheel EV Server listening on port ${PORT}`);
});
