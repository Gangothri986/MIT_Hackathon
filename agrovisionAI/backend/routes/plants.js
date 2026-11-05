
// import 'dotenv/config';
// import express from 'express';
// import multer from 'multer';
// import mongoose from 'mongoose';
// import { Plant } from '../models/Plant.js';

// const router = express.Router();

// // Image upload configuration
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 15 * 1024 * 1024, // 15 MB
//   },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'));
//     }
//   },
// });

// // Nyckel configuration
// const NYCKEL_CLIENT_ID = process.env.NYCKEL_CLIENT_ID;
// const NYCKEL_CLIENT_SECRET = process.env.NYCKEL_CLIENT_SECRET;
// const NYCKEL_FUNCTION_ID = process.env.NYCKEL_FUNCTION_ID;

// const NYCKEL_TOKEN_URL = 'https://www.nyckel.com/connect/token';

// let cachedToken = null;
// let tokenExpiresAt = 0;

// // Get and cache Nyckel access token
// async function getNyckelToken() {
//   if (cachedToken && Date.now() < tokenExpiresAt) {
//     return cachedToken;
//   }

//   if (!NYCKEL_CLIENT_ID || !NYCKEL_CLIENT_SECRET || !NYCKEL_FUNCTION_ID) {
//     throw new Error('Nyckel environment variables are missing');
//   }

//   const body = new URLSearchParams({
//     grant_type: 'client_credentials',
//     client_id: NYCKEL_CLIENT_ID,
//     client_secret: NYCKEL_CLIENT_SECRET,
//   });

//   const response = await fetch(NYCKEL_TOKEN_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body,
//   });

//   const data = await response.json();

//   if (!response.ok || !data.access_token) {
//     throw new Error('Unable to authenticate with Nyckel');
//   }

//   cachedToken = data.access_token;

//   const expiresIn = Number(data.expires_in) || 3600;
//   tokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 0) * 1000;

//   return cachedToken;
// }

// // Send image to Nyckel Wheat classifier
// async function predictWheatStage(imageBuffer, mimetype) {
//   const token = await getNyckelToken();

//   const base64Image = imageBuffer.toString('base64');
//   const imageData = `data:${mimetype};base64,${base64Image}`;

//   const response = await fetch(
//     `https://www.nyckel.com/v1/functions/${NYCKEL_FUNCTION_ID}/invoke?capture=false`,
//     {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         data: imageData,
//       }),
//     }
//   );

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error('Nyckel image prediction failed');
//   }

//   return result;
// }

// // Stage index mapping
// const wheatStageIndexes = {
//   Seedling: 0,
//   Flowering: 1,
//   Fruiting: 2,
//   Mature: 3,
// };

// // GET /api/plants - list plants with filters
// router.get('/', async (req, res) => {
//   try {
//     const { cropType, stage, health, risk, search } = req.query;
//     const query = {};

//     if (cropType && cropType !== 'All') {
//       query.cropType = cropType;
//     }
//     if (stage && stage !== 'All') {
//       query.currentStage = stage;
//     }
//     if (health && health !== 'All') {
//       query.healthStatus = health;
//     }
//     if (risk && risk !== 'All') {
//       query.riskLevel = risk;
//     }
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { customId: { $regex: search, $options: 'i' } },
//         { location: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const plants = await Plant.find(query).sort({ updatedAt: -1 });
//     res.json(plants);
//   } catch (error) {
//     console.error('Error fetching plants:', error);
//     res.status(500).json({ message: 'Error retrieving plant records' });
//   }
// });

// // POST /api/plants/:id/predict-growth-stage
// // Upload a wheat image and update its growth stage using Nyckel
// router.post('/:id/predict-growth-stage', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         message: 'Please upload a wheat plant image using the image field',
//       });
//     }

//     const plantQuery = mongoose.isValidObjectId(req.params.id)
//       ? { $or: [{ customId: req.params.id }, { _id: req.params.id }] }
//       : { customId: req.params.id };

//     const plant = await Plant.findOne(plantQuery);

//     if (!plant) {
//       return res.status(404).json({ message: 'Plant not found' });
//     }

//     if (plant.cropType !== 'Wheat') {
//       return res.status(400).json({
//         message: 'Nyckel growth-stage prediction is currently available only for Wheat plants',
//       });
//     }

//     const prediction = await predictWheatStage(
//       req.file.buffer,
//       req.file.mimetype
//     );

//     const predictedStage = prediction.labelName;

//     if (!Object.prototype.hasOwnProperty.call(wheatStageIndexes, predictedStage)) {
//       return res.status(502).json({
//         message: 'Nyckel returned an unknown growth-stage label',
//         receivedLabel: predictedStage,
//       });
//     }

//     let confidence = Number(prediction.confidence);

//     if (!Number.isFinite(confidence)) {
//       return res.status(502).json({
//         message: 'Nyckel did not return a valid confidence score',
//       });
//     }

//     // Convert decimal confidence (0-1) into percentage (0-100)
//     if (confidence <= 1) {
//       confidence *= 100;
//     }

//     const today = new Date().toISOString().split('T')[0];

//     // Update plant record
//     plant.currentStage = predictedStage;
//     plant.stageIndex = wheatStageIndexes[predictedStage];
//     plant.confidence = Number(confidence.toFixed(2));
//     plant.lastAnalysedDate = today;

//     // Add prediction to history
//     plant.history.push({
//       date: today,
//       stage: predictedStage,
//       healthScore: plant.healthScore,
//       note: `Growth stage predicted by Nyckel Wheat classifier with ${confidence.toFixed(2)}% confidence.`,
//     });

//     await plant.save();

//     res.json({
//       success: true,
//       message: 'Wheat growth stage predicted and plant record updated successfully',
//       prediction: {
//         stage: predictedStage,
//         confidence: Number(confidence.toFixed(2)),
//         stageIndex: wheatStageIndexes[predictedStage],
//       },
//       plant,
//     });
//   } catch (error) {
//     console.error('Wheat growth-stage prediction error:', error.message);

//     res.status(500).json({
//       message: 'Unable to predict wheat growth stage',
//       error: error.message,
//     });
//   }
// });

// // GET /api/plants/:id - get single plant
// router.get('/:id', async (req, res) => {
//   try {
//     const plant = await Plant.findOne({
//       $or: [{ customId: req.params.id }, { _id: req.params.id }],
//     });

//     if (!plant) {
//       return res.status(404).json({ message: 'Plant not found' });
//     }

//     res.json(plant);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving plant' });
//   }
// });

// // POST /api/plants - register new plant
// router.post('/', async (req, res) => {
//   try {
//     const {
//       name,
//       cropType,
//       variety,
//       location,
//       plantedDate,
//       currentStage,
//       imageUrl,
//     } = req.body;

//     const daysAfterPlanting = Math.max(
//       1,
//       Math.floor(
//         (new Date() - new Date(plantedDate || Date.now())) /
//           (1000 * 60 * 60 * 24)
//       )
//     );

//     const customId = `PLT-${(cropType || 'CRP')
//       .slice(0, 3)
//       .toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

//     const newPlant = new Plant({
//       customId,
//       name,
//       cropType: cropType || 'Tomato',
//       variety: variety || 'Commercial Variety',
//       location: location || 'North Field Bed 1',
//       plantedDate: plantedDate || new Date().toISOString().split('T')[0],
//       daysAfterPlanting,
//       currentStage: currentStage || 'Vegetative Growth',
//       stageIndex: 2,
//       confidence: 93.5,
//       healthStatus: 'Healthy',
//       healthScore: 90,
//       riskLevel: 'Low',
//       lastAnalysedDate: new Date().toISOString().split('T')[0],
//       imageUrl: imageUrl || '',
//       soilMoisture: '30%',
//       gddAccumulated: 400,
//       estimatedNextMilestone: {
//         stage: 'Bud Formation',
//         estimatedDate: new Date(Date.now() + 10 * 86400000)
//           .toISOString()
//           .split('T')[0],
//         daysRemaining: 10,
//         confidence: 89,
//       },
//       history: [
//         {
//           date: new Date().toISOString().split('T')[0],
//           stage: currentStage || 'Vegetative Growth',
//           healthScore: 90,
//           imageUrl: imageUrl || '',
//           note: 'Initial plant record registered in farm system.',
//         },
//       ],
//     });

//     await newPlant.save();
//     res.status(201).json(newPlant);
//   } catch (error) {
//     console.error('Error creating plant:', error);
//     res.status(500).json({ message: 'Error registering plant' });
//   }
// });

// // PUT /api/plants/:id - update plant
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Plant.findOneAndUpdate(
//       { $or: [{ customId: req.params.id }, { _id: req.params.id }] },
//       { $set: req.body },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: 'Plant not found' });

//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating plant' });
//   }
// });

// // DELETE /api/plants/:id
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Plant.findOneAndDelete({
//       $or: [{ customId: req.params.id }, { _id: req.params.id }],
//     });

//     if (!deleted) return res.status(404).json({ message: 'Plant not found' });

//     res.json({ message: 'Plant record removed successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting plant' });
//   }
// });

// export default router;



import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { Plant } from '../models/Plant.js';

const router = express.Router();

// ======================================================
// IMAGE UPLOAD CONFIGURATION
// ======================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
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

const NYCKEL_TOKEN_URL = 'https://www.nyckel.com/connect/token';

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
// GET NYCKEL ACCESS TOKEN
// ======================================================

async function getNyckelToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!NYCKEL_CLIENT_ID || !NYCKEL_CLIENT_SECRET || !NYCKEL_FUNCTION_ID) {
    throw new Error('Nyckel environment variables are missing');
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
      data.error_description || 'Unable to authenticate with Nyckel'
    );
  }

  cachedToken = data.access_token;

  const expiresIn = Number(data.expires_in) || 3600;
  tokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 0) * 1000;

  return cachedToken;
}

// ======================================================
// PREDICT WHEAT GROWTH STAGE USING NYCKEL
// ======================================================

async function predictWheatStage(imageBuffer, mimetype) {
  const token = await getNyckelToken();

  const base64Image = imageBuffer.toString('base64');
  const imageData = `data:${mimetype};base64,${base64Image}`;

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
      result.message || result.error || 'Nyckel image prediction failed'
    );
  }

  return result;
}

// ======================================================
// GET /api/plants
// LIST PLANTS WITH FILTERS
// ======================================================

router.get('/', async (req, res) => {
  try {
    const { cropType, stage, health, risk, search } = req.query;

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
        { name: { $regex: search, $options: 'i' } },
        { customId: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const plants = await Plant.find(query).sort({ updatedAt: -1 });

    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);

    res.status(500).json({
      message: 'Error retrieving plant records',
    });
  }
});

// ======================================================
// POST /api/plants/:id/predict-growth-stage
// NYCKEL WHEAT GROWTH-STAGE PREDICTION
// ======================================================

router.post(
  '/:id/predict-growth-stage',
  upload.single('image'),
  async (req, res) => {
    try {
      // Check uploaded image
      if (!req.file) {
        return res.status(400).json({
          message: 'Please upload a Wheat plant image using the image field',
        });
      }

      // Find plant using MongoDB ID or custom ID
      const plantQuery = mongoose.isValidObjectId(req.params.id)
        ? {
            $or: [
              { customId: req.params.id },
              { _id: req.params.id },
            ],
          }
        : {
            customId: req.params.id,
          };

      const plant = await Plant.findOne(plantQuery);

      if (!plant) {
        return res.status(404).json({
          message: 'Plant not found',
        });
      }

      // Only Wheat is supported by this Nyckel classifier
      if (plant.cropType !== 'Wheat') {
        return res.status(400).json({
          message: 'Nyckel growth-stage prediction is currently available only for Wheat plants',
        });
      }

      // Call Nyckel classifier
      const prediction = await predictWheatStage(
        req.file.buffer,
        req.file.mimetype
      );

      const predictedStage = prediction.labelName;

      // Validate predicted label
      if (
        !Object.prototype.hasOwnProperty.call(
          wheatStageIndexes,
          predictedStage
        )
      ) {
        return res.status(502).json({
          message: 'Nyckel returned an unknown growth-stage label',
          receivedLabel: predictedStage,
        });
      }

      // Validate confidence
      let confidence = Number(prediction.confidence);

      if (!Number.isFinite(confidence)) {
        return res.status(502).json({
          message: 'Nyckel did not return a valid confidence score',
        });
      }

      // Convert decimal confidence into percentage
      if (confidence <= 1) {
        confidence *= 100;
      }

      confidence = Math.min(100, Math.max(0, confidence));

      const today = new Date().toISOString().split('T')[0];

      // Update plant record
      plant.currentStage = predictedStage;
      plant.stageIndex = wheatStageIndexes[predictedStage];
      plant.confidence = Number(confidence.toFixed(2));
      plant.lastAnalysedDate = today;

      // Update plant history
      if (!Array.isArray(plant.history)) {
        plant.history = [];
      }

      plant.history.push({
        date: today,
        stage: predictedStage,
        healthScore: plant.healthScore || 90,
        imageUrl: plant.imageUrl || '',
        note: `Growth stage predicted by Nyckel Wheat classifier with ${confidence.toFixed(2)}% confidence.`,
      });

      await plant.save();

      // Return prediction and updated plant
      res.json({
        success: true,
        message: 'Wheat growth stage predicted and plant record updated successfully',

        prediction: {
          stage: predictedStage,
          confidence: Number(confidence.toFixed(2)),
          stageIndex: wheatStageIndexes[predictedStage],
        },

        plant,
      });

    } catch (error) {
      console.error(
        'Wheat growth-stage prediction error:',
        error
      );

      res.status(500).json({
        message: 'Unable to predict Wheat growth stage',
        error: error.message,
      });
    }
  }
);

// ======================================================
// GET /api/plants/:id
// GET SINGLE PLANT
// ======================================================

router.get('/:id', async (req, res) => {
  try {
    const plantQuery = mongoose.isValidObjectId(req.params.id)
      ? {
          $or: [
            { customId: req.params.id },
            { _id: req.params.id },
          ],
        }
      : {
          customId: req.params.id,
        };

    const plant = await Plant.findOne(plantQuery);

    if (!plant) {
      return res.status(404).json({
        message: 'Plant not found',
      });
    }

    res.json(plant);

  } catch (error) {
    console.error('Error retrieving plant:', error);

    res.status(500).json({
      message: 'Error retrieving plant',
    });
  }
});

// ======================================================
// POST /api/plants
// REGISTER NEW PLANT
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
      imageUrl,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Plant name is required',
      });
    }

    const selectedCrop = cropType || 'Tomato';

    const validPlantDate = plantedDate || new Date().toISOString().split('T')[0];

    const daysAfterPlanting = Math.max(
      1,
      Math.floor(
        (new Date() - new Date(validPlantDate)) /
          (1000 * 60 * 60 * 24)
      )
    );

    const customId = `PLT-${selectedCrop
      .slice(0, 3)
      .toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const initialStage = currentStage || 'Vegetative Growth';

    const newPlant = new Plant({
      customId,

      name: name.trim(),

      cropType: selectedCrop,

      variety: variety || 'Commercial Variety',

      location: location || 'North Field Bed 1',

      plantedDate: validPlantDate,

      daysAfterPlanting,

      currentStage: initialStage,

      stageIndex: selectedCrop === 'Wheat' ? 0 : 2,

      confidence: 93.5,

      healthStatus: 'Healthy',

      healthScore: 90,

      riskLevel: 'Low',

      lastAnalysedDate: new Date().toISOString().split('T')[0],

      imageUrl: imageUrl || '',

      soilMoisture: '30%',

      gddAccumulated: 400,

      estimatedNextMilestone: {
        stage: selectedCrop === 'Wheat' ? 'Flowering' : 'Bud Formation',

        estimatedDate: new Date(Date.now() + 10 * 86400000)
          .toISOString()
          .split('T')[0],

        daysRemaining: 10,

        confidence: 89,
      },

      history: [
        {
          date: new Date().toISOString().split('T')[0],

          stage: initialStage,

          healthScore: 90,

          imageUrl: imageUrl || '',

          note: 'Initial plant record registered in farm system.',
        },
      ],
    });

    await newPlant.save();

    res.status(201).json(newPlant);

  } catch (error) {
    console.error('Error creating plant:', error);

    res.status(500).json({
      message: 'Error registering plant',
      error: error.message,
    });
  }
});

// ======================================================
// PUT /api/plants/:id
// UPDATE PLANT
// ======================================================

router.put('/:id', async (req, res) => {
  try {
    const plantQuery = mongoose.isValidObjectId(req.params.id)
      ? {
          $or: [
            { customId: req.params.id },
            { _id: req.params.id },
          ],
        }
      : {
          customId: req.params.id,
        };

    const updated = await Plant.findOneAndUpdate(
      plantQuery,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: 'Plant not found',
      });
    }

    res.json(updated);

  } catch (error) {
    console.error('Error updating plant:', error);

    res.status(500).json({
      message: 'Error updating plant',
    });
  }
});

// ======================================================
// DELETE /api/plants/:id
// DELETE PLANT
// ======================================================

router.delete('/:id', async (req, res) => {
  try {
    const plantQuery = mongoose.isValidObjectId(req.params.id)
      ? {
          $or: [
            { customId: req.params.id },
            { _id: req.params.id },
          ],
        }
      : {
          customId: req.params.id,
        };

    const deleted = await Plant.findOneAndDelete(plantQuery);

    if (!deleted) {
      return res.status(404).json({
        message: 'Plant not found',
      });
    }

    res.json({
      message: 'Plant record removed successfully',
    });

  } catch (error) {
    console.error('Error deleting plant:', error);

    res.status(500).json({
      message: 'Error deleting plant',
    });
  }
});

// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;

