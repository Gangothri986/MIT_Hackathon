// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// const router = express.Router();

// // Ensure uploads directory exists
// const uploadDir = 'uploads/';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `plant_${Date.now()}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// });

// const GROWTH_STAGES = [
//   { id: 1, name: 'Seedling', code: 'seedling', durationDays: 14 },
//   { id: 2, name: 'Vegetative Growth', code: 'vegetative', durationDays: 25 },
//   { id: 3, name: 'Bud Formation', code: 'bud_formation', durationDays: 12 },
//   { id: 4, name: 'Flowering', code: 'flowering', durationDays: 18 },
//   { id: 5, name: 'Fruit Formation', code: 'fruit_formation', durationDays: 28 },
//   { id: 6, name: 'Maturity / Harvesting', code: 'maturity', durationDays: 15 },
// ];

// // POST /api/analyze - AI growth stage classification endpoint
// router.post('/', upload.single('image'), async (req, res) => {
//   try {
//     const { crop_type = 'Tomato', location = 'North Field' } = req.body;
//     const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

//     // Stage simulation based on crop type
//     let stageIndex = 4; // Default Flowering
//     if (crop_type.toLowerCase() === 'chilli') stageIndex = 2;
//     if (crop_type.toLowerCase() === 'paddy') stageIndex = 5;

//     const currentStageObj = GROWTH_STAGES[stageIndex - 1];
//     const prevStageObj = stageIndex > 1 ? GROWTH_STAGES[stageIndex - 2] : null;
//     const nextStageObj = stageIndex < GROWTH_STAGES.length ? GROWTH_STAGES[stageIndex] : null;

//     const confidence = Number((92 + Math.random() * 5).toFixed(1));
//     const daysToNext = nextStageObj ? Math.round(nextStageObj.durationDays * 0.6) : 0;
//     const nextDate = new Date();
//     nextDate.setDate(nextDate.getDate() + daysToNext);

//     const visualCharacteristics = [
//       `Identified ${currentStageObj.name} characteristics with ${confidence}% confidence`,
//       `Healthy leaf growth and stem branching observed`,
//       `Good plant vigor and rich green foliage color`,
//       `Foliar canopy development is right on track for this season`,
//     ];

//     const recommendations = [
//       stageIndex === 4
//         ? 'Maintain steady soil moisture; avoid heavy overhead watering to protect delicate flowers.'
//         : stageIndex === 2
//         ? 'Provide balanced fertilizer/manure to support leafy branch expansion.'
//         : stageIndex === 5
//         ? 'Ensure regular watering and potassium-rich nutrition to support good fruit size.'
//         : 'Continue normal watering and routine farm checks.',
//       'Take another photo in 7-10 days to track milestone progress.',
//     ];

//     res.json({
//       success: true,
//       plantId: `PLT-${crop_type.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
//       cropType: crop_type,
//       location,
//       timestamp: new Date().toISOString(),
//       imageUrl,
//       currentStage: currentStageObj.name,
//       stageIndex,
//       stageCode: currentStageObj.code,
//       confidence,
//       healthScore: stageIndex === 4 ? 92 : 88,
//       previousStage: prevStageObj ? prevStageObj.name : 'Planting',
//       nextStage: nextStageObj ? nextStageObj.name : 'Harvest Complete',
//       daysToNextMilestone: daysToNext,
//       estimatedNextMilestoneDate: nextDate.toISOString().split('T')[0],
//       accumulatedGDD: 680,
//       targetGDDToNext: 1100,
//       visualCharacteristics,
//       recommendations,
//       stageProgression: GROWTH_STAGES.map((s, idx) => ({
//         ...s,
//         isCompleted: idx + 1 < stageIndex,
//         isCurrent: idx + 1 === stageIndex,
//         isUpcoming: idx + 1 > stageIndex,
//       })),
//     });
//   } catch (error) {
//     console.error('Analysis error:', error);
//     res.status(500).json({ message: 'Error processing plant image' });
//   }
// });

// export default router;

import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { GoogleGenAI } from '@google/genai';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithFallback(generateRequest) {
  const MODEL = 'gemini-3.5-flash-lite';
  let lastError;

  for (const model of models) {
    // Try each model up to 2 times
    for (let attempt = 1; attempt <= 1; attempt++) {
      try {
        console.log(
          `Trying growth analysis with ${model}, attempt ${attempt}`
        );

        const response = await generateRequest(model);

        console.log(`Growth analysis succeeded using ${model}`);

        return response;
      } catch (error) {
        lastError = error;

        const status = error.status || error.code;

        // Retry only temporary server/rate-limit errors
        const temporaryError = [429, 500, 502, 503, 504].includes(
          Number(status)
        );

        if (!temporaryError) {
          throw error;
        }

        console.error(
          `${model} temporarily unavailable:`,
          status
        );

        if (attempt < 2) {
          await sleep(1500 * attempt);
        }
      }
    }

    console.log(`Switching to fallback model...`);
  }

  throw lastError;
}


const router = express.Router();

// ======================================================
// GEMINI CONFIGURATION
// ======================================================

const MODEL = 'gemini-3.5-flash';

function getGrowthAI() {
  const apiKey = process.env.GROWTH_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GROWTH_GEMINI_API_KEY is missing in backend .env');
  }

  return new GoogleGenAI({ apiKey });
}

// ======================================================
// IMAGE UPLOAD CONFIGURATION
// ======================================================

const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `plant_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ======================================================
// CROP-SPECIFIC GROWTH STAGES
// ======================================================

const CROP_STAGES = {
  wheat: [
    'Emergence',
    'Tillering',
    'Stem Elongation',
    'Heading',
    'Grain Filling',
    'Maturity',
  ],

  paddy: [
    'Seedling',
    'Tillering',
    'Booting',
    'Heading',
    'Grain Filling',
    'Maturity',
  ],

  rice: [
    'Seedling',
    'Tillering',
    'Booting',
    'Heading',
    'Grain Filling',
    'Maturity',
  ],

  maize: [
    'Emergence',
    'Vegetative Growth',
    'Tasseling',
    'Silking',
    'Grain Filling',
    'Maturity',
  ],

  tomato: [
    'Seedling',
    'Vegetative Growth',
    'Flowering',
    'Fruit Development',
    'Ripening',
  ],

  chilli: [
    'Seedling',
    'Vegetative Growth',
    'Flowering',
    'Fruit Development',
    'Maturity',
  ],

  cotton: [
    'Seedling',
    'Vegetative Growth',
    'Squaring',
    'Flowering',
    'Boll Development',
    'Boll Opening',
  ],

  ragi: [
    'Seedling',
    'Tillering',
    'Flowering',
    'Grain Filling',
    'Maturity',
  ],

  potato: [
    'Sprouting',
    'Vegetative Growth',
    'Tuber Development',
    'Maturation',
  ],

  groundnut: [
    'Emergence',
    'Vegetative Growth',
    'Flowering',
    'Pegging',
    'Pod Development',
    'Maturity',
  ],

  soybean: [
    'Emergence',
    'Vegetative Growth',
    'Flowering',
    'Pod Formation',
    'Seed Filling',
    'Maturity',
  ],

  sugarcane: [
    'Germination',
    'Tillering',
    'Grand Growth',
    'Maturation',
  ],
};

// ======================================================
// HELPER: NORMALIZE CROP NAME
// ======================================================

function normalizeCrop(cropType) {
  const crop = String(cropType || 'tomato')
    .trim()
    .toLowerCase();

  const aliases = {
    'finger millet': 'ragi',
    rice: 'paddy',
  };

  return aliases[crop] || crop;
}

// ======================================================
// HELPER: CREATE STAGE CODE
// ======================================================

function createStageCode(stage) {
  return stage
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ======================================================
// GEMINI GROWTH-STAGE IMAGE ANALYSIS
// ======================================================

async function analyzeGrowthImage(imagePath, mimetype, cropType) {
  const ai = getGrowthAI();

  const imageBuffer = await fs.promises.readFile(imagePath);

  const base64Image = imageBuffer.toString('base64');

  const crop = normalizeCrop(cropType);

  const stages = CROP_STAGES[crop];

  if (!stages) {
    throw new Error(`Unsupported crop type: ${cropType}`);
  }

  const prompt = `
You are an agricultural image-analysis assistant.

Analyse the uploaded photograph of a ${crop} plant.

The farmer selected this crop: ${crop}.

The valid growth stages for this crop are:
${stages.join(', ')}

YOUR TASK:

1. Examine the actual uploaded plant photograph.
2. Estimate the current growth stage.
3. Select exactly one stage from the valid stage list.
4. Describe visible evidence from the image.
5. Estimate confidence between 0 and 100.
6. Explain any uncertainty.
7. Suggest three practical farming recommendations.
8. Identify the next growth stage.

IMPORTANT RULES:

- Do not invent visual observations.
- Do not select a stage based only on the crop name.
- Examine leaves, stems, flowers, fruits, grains and other visible features.
- Do not infer exact plant age from the image.
- If the crop does not appear to match the selected crop, set isReliable to false.
- If the image is unclear or the growth stage cannot be distinguished, set isReliable to false.
- Confidence is an AI estimate, not a scientifically calibrated probability.
- Recommendations must be relevant to the identified growth stage.
- Do not claim that the plant is healthy unless visible evidence supports it.

Return ONLY valid JSON in this format:

{
  "crop": "${crop}",
  "stage": "one stage from the allowed list",
  "confidence": 80,
  "isReliable": true,
  "visualEvidence": [
    "Visible observation 1",
    "Visible observation 2"
  ],
  "uncertainty": "Explain limitations of the photograph",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],
  "nextStage": "Next growth stage"
}
`;

const response = await ai.models.generateContent({
  model: MODEL,

  contents: [
    {
      inlineData: {
        mimeType: mimetype,
        data: base64Image,
      },
    },
    {
      text: prompt,
    },
  ],

  config: {
    responseMimeType: 'application/json',
    maxOutputTokens: 1000,
  },
});

  if (!response.text) {
    throw new Error('Gemini returned an empty response');
  }

  const result = JSON.parse(response.text);

  if (!stages.includes(result.stage)) {
    throw new Error(
      `Gemini returned an invalid stage: ${result.stage}`
    );
  }

  const confidence = Number(result.confidence);

  if (!Number.isFinite(confidence)) {
    throw new Error('Invalid confidence returned by Gemini');
  }

  return {
    ...result,
    crop,
    confidence: Math.min(100, Math.max(0, confidence)),
    stages,
  };
}

// ======================================================
// POST /api/analyze
// GEMINI GROWTH-STAGE ANALYSIS
// ======================================================

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      crop_type = 'Tomato',
      location = 'North Field',
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a plant image.',
      });
    }

    const crop = normalizeCrop(crop_type);

    if (!CROP_STAGES[crop]) {
      return res.status(400).json({
        success: false,
        message: `Growth-stage prediction is not configured for ${crop_type}.`,
      });
    }

    // Call Gemini with the actual uploaded image
    const prediction = await analyzeGrowthImage(
      req.file.path,
      req.file.mimetype,
      crop
    );

   const stageIndex = prediction.stages.indexOf(
  prediction.stage
);

if (stageIndex === -1) {
  return res.status(422).json({
    success: false,
    message: 'The growth stage could not be identified. Please upload a clearer plant image.',
  });
}

// Keep uncertain predictions, but clearly label them.
const isReliable = prediction.isReliable === true;
const confidence = prediction.confidence;

console.log('Gemini prediction:', {
  crop,
  stage: prediction.stage,
  confidence,
  isReliable,
});

    const currentStageObj = {
      id: stageIndex + 1,
      name: prediction.stage,
      code: createStageCode(prediction.stage),
    };

    const prevStageObj =
      stageIndex > 0
        ? prediction.stages[stageIndex - 1]
        : null;

    const nextStageObj =
      stageIndex < prediction.stages.length - 1
        ? prediction.stages[stageIndex + 1]
        : null;

    // Build frontend-compatible stage progression
    const stageProgression = prediction.stages.map(
      (stage, index) => ({
        id: index + 1,
        name: stage,
        code: createStageCode(stage),

        isCompleted: index < stageIndex,
        isCurrent: index === stageIndex,
        isUpcoming: index > stageIndex,
      })
    );

    const imageUrl = `/uploads/${req.file.filename}`;

    return res.json({
      success: true,

      plantId: `PLT-${crop.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,

      cropType: crop_type,
      location,

      timestamp: new Date().toISOString(),
      imageUrl,

      currentStage: currentStageObj.name,

      // Existing frontend expects one-based stage numbering
      stageIndex: stageIndex + 1,

      stageCode: currentStageObj.code,

      confidence: Number(prediction.confidence.toFixed(1)),

      healthScore: null,

      previousStage: prevStageObj || 'Planting',

      nextStage: nextStageObj || 'Harvest Complete',

      // No plant age or environmental measurements inferred from one photo
      daysToNextMilestone: null,
      estimatedNextMilestoneDate: null,
      accumulatedGDD: null,
      targetGDDToNext: null,

      visualCharacteristics: prediction.visualEvidence,

      recommendations: prediction.recommendations,

      uncertainty: prediction.uncertainty || null,

isReliable,

model: MODEL,

      stageProgression,
    });

  } catch (error) {
    console.error('Gemini growth analysis error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error processing plant image using Gemini.',
      error: error.message,
    });
  }
});

export default router;
