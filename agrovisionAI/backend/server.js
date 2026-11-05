import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';


import authRoutes from './routes/auth.js';
import plantRoutes from './routes/plants.js';
import analysisRoutes from './routes/analysis.js';
import diseaseRoutes from './routes/disease.js';
import weatherRoutes from './routes/weather.js';

import { User } from './models/User.js';
import { Plant } from './models/Plant.js';
import { DiseaseRecord } from './models/DiseaseRecord.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrovision';

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded plant photos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health & Status Check
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    system: 'AgroVision AI Express & MongoDB Backend',
    database: isConnected ? 'Connected to MongoDB' : 'Awaiting MongoDB Connection',
    mongoUriConfigured: Boolean(process.env.MONGODB_URI),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/weather', weatherRoutes);

// Root summary
app.get('/', (req, res) => {
  res.json({
    name: 'AgroVision AI Backend API',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Standby for MongoDB URI',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET  /api/plants',
      'POST /api/plants',
      'POST /api/analyze',
      'POST /api/disease/detect',
      'GET  /api/disease/history',
      'GET  /api/weather/current',
      'GET  /api/weather/forecast',
    ],
  });
});

// Seed MongoDB with initial farmer data if collection is fresh
async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('farmer123', 10);
      await User.create({
        name: 'Ramesh Kumar',
        email: 'ramesh.farmer@agrovision.in',
        password: hashedPassword,
        farmName: 'Green Valley Farm',
        location: 'Southern Agricultural Region',
        farmSize: '5 Acres',
        cropsMonitored: ['Tomato', 'Chilli', 'Paddy'],
      });
      console.log('🌱 Seeded default farmer account: ramesh.farmer@agrovision.in');
    }

    const plantCount = await Plant.countDocuments();
    if (plantCount === 0) {
      await Plant.insertMany([
        {
          customId: 'PLT-TOM-204',
          name: 'Tomato Hybrid - Field A',
          cropType: 'Tomato',
          variety: 'High Yield Hybrid',
          location: 'North Greenhouse - Bed 2',
          plantedDate: '2026-09-15',
          daysAfterPlanting: 50,
          currentStage: 'Flowering',
          stageIndex: 4,
          confidence: 94.6,
          healthStatus: 'Healthy',
          healthScore: 92,
          riskLevel: 'Low',
          lastAnalysedDate: '2026-11-03',
          imageUrl: '/frontend/src/assets/images/plant_tomato_flowering_1793801902356.jpg',
          soilMoisture: '34%',
          gddAccumulated: 680,
          estimatedNextMilestone: {
            stage: 'Fruit Formation',
            estimatedDate: '2026-11-12',
            daysRemaining: 8,
            confidence: 91.2,
          },
        },
        {
          customId: 'PLT-CHL-108',
          name: 'Green Chilli - Field C',
          cropType: 'Chilli',
          variety: 'Commercial Pepper',
          location: 'South Open Bed 1',
          plantedDate: '2026-10-01',
          daysAfterPlanting: 34,
          currentStage: 'Vegetative Growth',
          stageIndex: 2,
          confidence: 96.2,
          healthStatus: 'Healthy',
          healthScore: 89,
          riskLevel: 'Moderate',
          lastAnalysedDate: '2026-11-02',
          imageUrl: '/frontend/src/assets/images/plant_chilli_vegetative_1793801904672.jpg',
          soilMoisture: '28%',
          gddAccumulated: 420,
          estimatedNextMilestone: {
            stage: 'Bud Formation',
            estimatedDate: '2026-11-14',
            daysRemaining: 10,
            confidence: 88.5,
          },
        },
        {
          customId: 'PLT-PAD-032',
          name: 'Paddy Rice - Sector 2',
          cropType: 'Paddy',
          variety: 'Medium Grain Variety',
          location: 'Lowland Canal Plot',
          plantedDate: '2026-09-01',
          daysAfterPlanting: 64,
          currentStage: 'Fruit Formation',
          stageIndex: 5,
          confidence: 92.8,
          healthStatus: 'Attention Needed',
          healthScore: 78,
          riskLevel: 'Moderate',
          lastAnalysedDate: '2026-11-04',
          imageUrl: '/frontend/src/assets/images/plant_paddy_field_1793801904802.jpg',
          soilMoisture: 'Flooded (4 cm)',
          gddAccumulated: 980,
          estimatedNextMilestone: {
            stage: 'Maturity / Harvesting',
            estimatedDate: '2026-11-28',
            daysRemaining: 24,
            confidence: 93.4,
          },
        },
      ]);
      console.log('🌾 Seeded default monitored plants to MongoDB!');
    }
  } catch (err) {
    console.warn('Seeding note:', err.message);
  }
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 })
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully at:', MONGODB_URI);
    await seedInitialData();
  })
  .catch((err) => {
    console.log('💡 MongoDB Status: Offline / Awaiting actual URI');
    console.log('👉 You can add your actual MongoDB Atlas or local URI in backend/.env:');
    console.log('   MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/agrovision"');
    console.log('🚀 Backend API server is running and ready on port ' + PORT);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`🌾 AgroVision AI Backend listening on http://localhost:${PORT}`);
  console.log(`📡 Endpoints available under /api/*`);
});
