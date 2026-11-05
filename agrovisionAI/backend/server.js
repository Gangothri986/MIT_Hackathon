
// import 'dotenv/config';
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import path from 'path';
// import bcrypt from 'bcryptjs';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// import authRoutes from './routes/auth.js';
// import plantRoutes from './routes/plants.js';
// import analysisRoutes from './routes/analysis.js';
// import diseaseRoutes from './routes/disease.js';
// import weatherRoutes from './routes/weather.js';

// import { User } from './models/User.js';
// import { Plant } from './models/Plant.js';

// // ======================================================
// // DIRECTORY CONFIGURATION
// // ======================================================

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadDir = path.join(__dirname, 'uploads');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ======================================================
// // APP CONFIGURATION
// // ======================================================

// const app = express();
// const PORT = process.env.PORT || 5000;

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error('MONGODB_URI is missing in backend/.env');
// }

// // ======================================================
// // MIDDLEWARE
// // ======================================================

// app.use(cors({ origin: '*' }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded images
// app.use('/uploads', express.static(uploadDir));

// // ======================================================
// // HEALTH CHECK
// // ======================================================

// app.get('/api/health', (req, res) => {
//   const isConnected = mongoose.connection.readyState === 1;

//   res.status(isConnected ? 200 : 503).json({
//     status: 'online',
//     database: isConnected ? 'Connected to MongoDB Atlas' : 'Disconnected',
//     mongoUriConfigured: Boolean(MONGODB_URI),
//     timestamp: new Date().toISOString(),
//   });
// });

// // ======================================================
// // API ROUTES
// // ======================================================

// app.use('/api/auth', authRoutes);
// app.use('/api/plants', plantRoutes);
// app.use('/api/analyze', analysisRoutes);
// app.use('/api/disease', diseaseRoutes);
// app.use('/api/weather', weatherRoutes);

// // ======================================================
// // ROOT ROUTE
// // ======================================================

// app.get('/', (req, res) => {
//   res.json({
//     name: 'AgroVision AI Backend API',

//     database:
//       mongoose.connection.readyState === 1
//         ? 'Connected to MongoDB Atlas'
//         : 'Disconnected',

//     endpoints: [
//       'GET /api/health',
//       'POST /api/auth/login',
//       'POST /api/auth/register',
//       'GET /api/auth/me',
//       'GET /api/plants',
//       'POST /api/plants',
//       'POST /api/analyze',
//       'POST /api/disease/detect',
//       'GET /api/disease/history',
//       'GET /api/weather/current',
//       'GET /api/weather/forecast',
//     ],
//   });
// });

// // ======================================================
// // SEED INITIAL DATA
// // ======================================================

// async function seedInitialData() {
//   try {
//     // ----------------------------------------------
//     // CREATE DEFAULT FARMER IF NO USERS EXIST
//     // ----------------------------------------------

//     let farmer = await User.findOne();

//     if (!farmer) {
//       const hashedPassword = await bcrypt.hash(
//         'farmer123',
//         10
//       );

//       farmer = await User.create({
//         name: 'Ramesh Kumar',
//         email: 'ramesh.farmer@agrovision.in',
//         password: hashedPassword,
//         farmName: 'Green Valley Farm',
//         location: 'Southern Agricultural Region',
//         farmSize: '5 Acres',
//         cropsMonitored: ['Tomato', 'Chilli', 'Paddy'],
//       });

//       console.log('Default farmer account created.');
//     }

//     // ----------------------------------------------
//     // CREATE SAMPLE PLANTS IF COLLECTION IS EMPTY
//     // ----------------------------------------------

//     const plantCount = await Plant.countDocuments();

//     if (plantCount === 0) {
//       await Plant.insertMany([
//         {
//           customId: 'PLT-TOM-204',
//           name: 'Tomato Hybrid - Field A',
//           cropType: 'Tomato',
//           variety: 'High Yield Hybrid',
//           location: 'North Greenhouse - Bed 2',
//           plantedDate: '2026-09-15',
//           daysAfterPlanting: 50,

//           currentStage: 'Flowering',
//           stageIndex: 2,

//           confidence: 94.6,
//           healthStatus: 'Healthy',
//           healthScore: 92,
//           riskLevel: 'Low',

//           lastAnalysedDate: '2026-11-03',

//           // No broken frontend source-file paths.
//           // Empty image URL allows frontend fallback images.
//           imageUrl: '',

//           soilMoisture: '34%',
//           gddAccumulated: 680,

//           estimatedNextMilestone: {
//             stage: 'Fruit Development',
//             estimatedDate: '2026-11-12',
//             daysRemaining: 8,
//             confidence: 91.2,
//           },

//           userId: farmer._id,
//         },

//         {
//           customId: 'PLT-CHL-108',
//           name: 'Green Chilli - Field C',
//           cropType: 'Chilli',
//           variety: 'Commercial Pepper',
//           location: 'South Open Bed 1',
//           plantedDate: '2026-10-01',
//           daysAfterPlanting: 34,

//           currentStage: 'Vegetative Growth',
//           stageIndex: 1,

//           confidence: 96.2,
//           healthStatus: 'Healthy',
//           healthScore: 89,
//           riskLevel: 'Moderate',

//           lastAnalysedDate: '2026-11-02',
//           imageUrl: '',

//           soilMoisture: '28%',
//           gddAccumulated: 420,

//           estimatedNextMilestone: {
//             stage: 'Flowering',
//             estimatedDate: '2026-11-14',
//             daysRemaining: 10,
//             confidence: 88.5,
//           },

//           userId: farmer._id,
//         },

//         {
//           customId: 'PLT-PAD-032',
//           name: 'Paddy Rice - Sector 2',
//           cropType: 'Paddy',
//           variety: 'Medium Grain Variety',
//           location: 'Lowland Canal Plot',
//           plantedDate: '2026-09-01',
//           daysAfterPlanting: 64,

//           currentStage: 'Grain Filling',
//           stageIndex: 4,

//           confidence: 92.8,
//           healthStatus: 'Attention Needed',
//           healthScore: 78,
//           riskLevel: 'Moderate',

//           lastAnalysedDate: '2026-11-04',
//           imageUrl: '',

//           soilMoisture: 'Flooded (4 cm)',
//           gddAccumulated: 980,

//           estimatedNextMilestone: {
//             stage: 'Maturity',
//             estimatedDate: '2026-11-28',
//             daysRemaining: 24,
//             confidence: 93.4,
//           },

//           userId: farmer._id,
//         },
//       ]);

//       console.log('Default monitored plants created.');
//     } else {
//       console.log(
//         `Existing MongoDB plants found: ${plantCount}. Skipping plant seeding.`
//       );
//     }

//   } catch (error) {
//     console.error('Initial data seeding error:', error.message);
//     throw error;
//   }
// }

// // ======================================================
// // CONNECT TO MONGODB ATLAS
// // ======================================================

// async function startServer() {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log('Connected to MongoDB Atlas successfully.');

//     await seedInitialData();

//     app.listen(PORT, () => {
//       console.log(`AgroVision AI Backend running at http://localhost:${PORT}`);
//       console.log(`API routes: http://localhost:${PORT}/api`);
//       console.log(`Uploaded images: http://localhost:${PORT}/uploads`);
//       console.log(`Health check: http://localhost:${PORT}/api/health`);
//     });

//   } catch (error) {
//     console.error('Server startup failed:', error.message);
//     process.exit(1);
//   }
// }

// startServer();

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import plantRoutes from './routes/plants.js';
import analysisRoutes from './routes/analysis.js';
import diseaseRoutes from './routes/disease.js';
import weatherRoutes from './routes/weather.js';

// ======================================================
// DIRECTORY CONFIGURATION
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================================================
// APP CONFIGURATION
// ======================================================

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing in backend/.env');
}

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadDir));

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  res.status(isConnected ? 200 : 503).json({
    status: 'online',
    database: isConnected
      ? 'Connected to MongoDB Atlas'
      : 'Disconnected',
    mongoUriConfigured: Boolean(MONGODB_URI),
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/weather', weatherRoutes);

// ======================================================
// ROOT ROUTE
// ======================================================

app.get('/', (req, res) => {
  res.json({
    name: 'AgroVision AI Backend API',

    database:
      mongoose.connection.readyState === 1
        ? 'Connected to MongoDB Atlas'
        : 'Disconnected',

    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /api/plants',
      'POST /api/plants',
      'POST /api/analyze',
      'POST /api/disease/detect',
      'GET /api/disease/history',
      'GET /api/weather/current',
      'GET /api/weather/forecast',
    ],
  });
});

// ======================================================
// NO AUTOMATIC DEMO DATA
// Users and plants are created through application APIs.
// ======================================================

// ======================================================
// CONNECT TO MONGODB ATLAS
// ======================================================

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('Connected to MongoDB Atlas successfully.');
    console.log('Database:', mongoose.connection.name);
    console.log('User collection: users');
    console.log('Automatic demo user creation: DISABLED');
    console.log('Automatic sample plant creation: DISABLED');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `AgroVision AI Backend running at http://localhost:${PORT}`
      );
      console.log(`API routes: http://localhost:${PORT}/api`);
      console.log(`Uploaded images: http://localhost:${PORT}/uploads`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();