
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

import { Plant } from '../models/Plant.js';

const router = express.Router();

// ======================================================
// NYCKEL IMAGE UPLOAD
// ======================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ======================================================
// NYCKEL CONFIGURATION
// ======================================================

const NYCKEL_CLIENT_ID = process.env.NYCKEL_CLIENT_ID;
const NYCKEL_CLIENT_SECRET = process.env.NYCKEL_CLIENT_SECRET;
const NYCKEL_FUNCTION_ID = process.env.NYCKEL_FUNCTION_ID;

const NYCKEL_TOKEN_URL =
  'https://www.nyckel.com/connect/token';

let cachedToken = null;
let tokenExpiresAt = 0;

// ======================================================
// WHEAT GROWTH STAGES
// ======================================================

const wheatStageIndexes = {
  Seedling: 0,
  Flowering: 1,
  Fruiting: 2,
  Mature: 3,
};

// ======================================================
// HELPERS
// ======================================================

const getToday = () =>
  new Date().toISOString().split('T')[0];

const getPlantQuery = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return {
      $or: [
        { customId: id },
        { _id: id },
      ],
    };
  }

  return { customId: id };
};

const generateCustomId = (cropType) => {
  const prefix = String(cropType)
    .slice(0, 3)
    .toUpperCase();

  const suffix = randomBytes(3)
    .toString('hex')
    .toUpperCase();

  return `PLT-${prefix}-${suffix}`;
};

// ======================================================
// GET NYCKEL ACCESS TOKEN
// ======================================================

async function getNyckelToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (
    !NYCKEL_CLIENT_ID ||
    !NYCKEL_CLIENT_SECRET ||
    !NYCKEL_FUNCTION_ID
  ) {
    throw new Error(
      'Nyckel environment variables are missing'
    );
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: NYCKEL_CLIENT_ID,
    client_secret: NYCKEL_CLIENT_SECRET,
  });

  const response = await fetch(NYCKEL_TOKEN_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },

    body,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
      'Unable to authenticate with Nyckel'
    );
  }

  cachedToken = data.access_token;

  const expiresIn = Number(data.expires_in) || 3600;

  tokenExpiresAt =
    Date.now() + Math.max(expiresIn - 60, 0) * 1000;

  return cachedToken;
}

// ======================================================
// PREDICT WHEAT STAGE USING NYCKEL
// ======================================================

async function predictWheatStage(imageBuffer, mimetype) {
  const token = await getNyckelToken();

  const base64Image = imageBuffer.toString('base64');

  const imageData =
    `data:${mimetype};base64,${base64Image}`;

  const response = await fetch(
    `https://www.nyckel.com/v1/functions/${NYCKEL_FUNCTION_ID}/invoke?capture=false`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        data: imageData,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      'Nyckel image prediction failed'
    );
  }

  return result;
}

// ======================================================
// GET ALL PLANTS
// GET /api/plants
// ======================================================

router.get('/', async (req, res) => {
  try {
    const {
      cropType,
      stage,
      health,
      risk,
      search,
    } = req.query;

    const query = {};

    if (cropType && cropType !== 'All') {
      query.cropType = cropType;
    }

    if (stage && stage !== 'All') {
      query.currentStage = stage;
    }

    if (health && health !== 'All') {
      query.healthStatus = health;
    }

    if (risk && risk !== 'All') {
      query.riskLevel = risk;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          customId: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          location: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const plants = await Plant.find(query)
      .sort({ updatedAt: -1 });

    return res.json(plants);

  } catch (error) {
    console.error('Error fetching plants:', error);

    return res.status(500).json({
      success: false,
      message: 'Error retrieving plant records',
    });
  }
});

// ======================================================
// NYCKEL WHEAT PREDICTION
// POST /api/plants/:id/predict-growth-stage
// ======================================================

router.post(
  '/:id/predict-growth-stage',
  upload.single('image'),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a Wheat plant image.',
        });
      }

      const plant = await Plant.findOne(
        getPlantQuery(req.params.id)
      );

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found',
        });
      }

      if (plant.cropType !== 'Wheat') {
        return res.status(400).json({
          success: false,
          message:
            'Nyckel prediction is available only for Wheat.',
        });
      }

      const prediction = await predictWheatStage(
        req.file.buffer,
        req.file.mimetype
      );

      const predictedStage = prediction.labelName;

      if (
        !Object.prototype.hasOwnProperty.call(
          wheatStageIndexes,
          predictedStage
        )
      ) {
        return res.status(502).json({
          success: false,
          message: 'Nyckel returned an unknown growth stage.',
          receivedLabel: predictedStage,
        });
      }

      let confidence = Number(prediction.confidence);

      if (!Number.isFinite(confidence)) {
        return res.status(502).json({
          success: false,
          message: 'Invalid confidence returned by Nyckel.',
        });
      }

      if (confidence <= 1) {
        confidence *= 100;
      }

      confidence = Math.min(
        100,
        Math.max(0, confidence)
      );

      const today = getToday();

      plant.currentStage = predictedStage;

      plant.stageIndex =
        wheatStageIndexes[predictedStage];

      plant.confidence = Number(
        confidence.toFixed(2)
      );

      plant.lastAnalysedDate = today;

      if (!Array.isArray(plant.history)) {
        plant.history = [];
      }

      plant.history.push({
        date: today,
        stage: predictedStage,
        healthScore: plant.healthScore || 90,
        imageUrl: plant.imageUrl || '',
        note:
          `Nyckel Wheat prediction: ${predictedStage} ` +
          `(${confidence.toFixed(2)}% confidence).`,
      });

      await plant.save();

      return res.json({
        success: true,

        message:
          'Wheat growth stage updated successfully.',

        prediction: {
          stage: predictedStage,
          confidence: Number(confidence.toFixed(2)),
          stageIndex: wheatStageIndexes[predictedStage],
        },

        plant,
      });

    } catch (error) {
      console.error(
        'Wheat prediction error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Unable to predict Wheat growth stage.',
        error: error.message,
      });
    }
  }
);

// ======================================================
// GET SINGLE PLANT
// GET /api/plants/:id
// ======================================================

router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findOne(
      getPlantQuery(req.params.id)
    );

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found',
      });
    }

    return res.json(plant);

  } catch (error) {
    console.error('Error retrieving plant:', error);

    return res.status(500).json({
      success: false,
      message: 'Error retrieving plant',
    });
  }
});

// ======================================================
// CREATE NEW PLANT
// POST /api/plants
// ======================================================

router.post('/', async (req, res) => {
  try {
    const {
      name,
      cropType,
      variety,
      location,
      plantedDate,
      currentStage,
      stageIndex,
      confidence,
      imageUrl,
      lastAnalysedDate,
      history,
    } = req.body;

    // ----------------------------------------------
    // REQUIRED FIELD VALIDATION
    // ----------------------------------------------

    if (
      !name ||
      typeof name !== 'string' ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Plant name is required.',
      });
    }

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'Crop type is required.',
      });
    }

    if (!currentStage) {
      return res.status(400).json({
        success: false,
        message: 'Growth stage is required.',
      });
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Uploaded image URL is required.',
      });
    }

    // ----------------------------------------------
    // DATE VALIDATION
    // ----------------------------------------------

    const validPlantDate = plantedDate || getToday();

    const parsedDate = new Date(validPlantDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid planted date.',
      });
    }

    const daysAfterPlanting = Math.max(
      0,
      Math.floor(
        (Date.now() - parsedDate.getTime()) /
        (1000 * 60 * 60 * 24)
      )
    );

    // ----------------------------------------------
    // PREDICTION VALIDATION
    // ----------------------------------------------

    const parsedStageIndex = Number(stageIndex);

    const parsedConfidence = Number(confidence);

    if (
      !Number.isInteger(parsedStageIndex) ||
      parsedStageIndex < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid growth stage index.',
      });
    }

    if (
      !Number.isFinite(parsedConfidence) ||
      parsedConfidence < 0 ||
      parsedConfidence > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Confidence must be between 0 and 100.',
      });
    }

    // ----------------------------------------------
    // HISTORY
    // ----------------------------------------------

    const today = getToday();

    const plantHistory =
      Array.isArray(history) && history.length > 0
        ? history
        : [
            {
              date: today,
              stage: currentStage,
              healthScore: 90,
              imageUrl,
              note: 'Plant registered using AI growth-stage analysis.',
            },
          ];

    // ----------------------------------------------
    // CREATE MONGODB DOCUMENT
    // ----------------------------------------------

    const newPlant = new Plant({
      customId: generateCustomId(cropType),

      name: name.trim(),

      cropType,

      variety: variety || 'Commercial Variety',

      location: location || 'North Field',

      plantedDate: validPlantDate,

      daysAfterPlanting,

      currentStage,

      stageIndex: parsedStageIndex,

      confidence: parsedConfidence,

      healthStatus: 'Healthy',

      healthScore: 90,

      riskLevel: 'Low',

      lastAnalysedDate:
        lastAnalysedDate || today,

      imageUrl,

      soilMoisture: '30%',

      gddAccumulated: 400,

      estimatedNextMilestone: {
        stage: 'Not calculated',
        estimatedDate: today,
        daysRemaining: 0,
        confidence: 0,
      },

      history: plantHistory,

      // Associate with logged-in user when auth middleware
      // supplies req.user. No user ID is fabricated.
      ...(req.user?._id && {
        userId: req.user._id,
      }),
    });

    await newPlant.save();

    return res.status(201).json({
      success: true,
      message: 'Plant successfully registered.',
      plant: newPlant,
    });

  } catch (error) {
    console.error('Error creating plant:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate plant ID. Please try again.',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Plant validation failed.',
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error registering plant.',
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE PLANT
// PUT /api/plants/:id
// ======================================================

router.put('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'cropType',
      'variety',
      'location',
      'plantedDate',
      'daysAfterPlanting',
      'currentStage',
      'stageIndex',
      'confidence',
      'healthStatus',
      'healthScore',
      'riskLevel',
      'lastAnalysedDate',
      'imageUrl',
      'soilMoisture',
      'gddAccumulated',
      'gddTargetFlowering',
      'gddTargetMaturity',
      'estimatedNextMilestone',
      'observations',
      'history',
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid update fields provided.',
      });
    }

    const updatedPlant = await Plant.findOneAndUpdate(
      getPlantQuery(req.params.id),

      { $set: updateData },

      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPlant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found.',
      });
    }

    return res.json(updatedPlant);

  } catch (error) {
    console.error('Error updating plant:', error);

    return res.status(
      error.name === 'ValidationError' ? 400 : 500
    ).json({
      success: false,
      message: 'Error updating plant.',
      error: error.message,
    });
  }
});

// ======================================================
// DELETE PLANT
// DELETE /api/plants/:id
// ======================================================

router.delete('/:id', async (req, res) => {
  try {
    const deletedPlant = await Plant.findOneAndDelete(
      getPlantQuery(req.params.id)
    );

    if (!deletedPlant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Plant deleted successfully.',
    });

  } catch (error) {
    console.error('Error deleting plant:', error);

    return res.status(500).json({
      success: false,
      message: 'Error deleting plant.',
    });
  }
});

export default router;
