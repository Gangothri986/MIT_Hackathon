
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { GoogleGenAI } from '@google/genai';
import { GrowthAnalysis } from '../models/GrowthAnalysis.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// DIRECTORY CONFIGURATION
// ======================================================

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================================================
// GEMINI CONFIGURATION
// ======================================================

const MODEL = 'gemini-3.5-flash';

function getGrowthAI() {
  const apiKey = process.env.GROWTH_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GROWTH_GEMINI_API_KEY is missing in backend/.env'
    );
  }

  return new GoogleGenAI({ apiKey });
}

// ======================================================
// IMAGE UPLOAD CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `plant_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
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
// NORMALIZE CROP NAME
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
// CREATE STAGE CODE
// ======================================================

function createStageCode(stage) {
  return stage
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ======================================================
// SAFE GEMINI JSON PARSER
// ======================================================

function parseGeminiJSON(responseText) {
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Gemini returned an empty response.');
  }

  let cleanedText = responseText.trim();

  // Remove Markdown code fences if present.
  cleanedText = cleanedText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Extract the JSON object if additional text surrounds it.
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 ||
      lastBrace < firstBrace) {
    throw new Error(
      'Gemini did not return a complete JSON object.'
    );
  }

  const jsonText = cleanedText.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini raw response:', responseText);

    throw new Error(
      `Gemini returned malformed or incomplete JSON: ${error.message}`
    );
  }
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
2. Estimate its current growth stage.
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
- If the crop does not match the selected crop, set isReliable to false.
- If the image is unclear or the growth stage cannot be distinguished, set isReliable to false.
- Confidence is an AI estimate, not a scientifically calibrated probability.
- Recommendations must be relevant to the identified growth stage.
- Do not claim that the plant is healthy unless visible evidence supports it.
- If the plant is not identifiable, set isReliable to false.
- Keep all descriptions concise.
- Return complete JSON. Do not exceed the output limit.
- Do not include Markdown or text outside the JSON object.

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
      maxOutputTokens: 2000,
    },
  });

  const result = parseGeminiJSON(response.text);

  // Validate response structure.
  if (
    !result ||
    typeof result !== 'object' ||
    Array.isArray(result)
  ) {
    throw new Error('Gemini returned an invalid response structure.');
  }

  // Validate growth stage.
  if (!stages.includes(result.stage)) {
    throw new Error(
      `Gemini returned an invalid stage: ${result.stage}`
    );
  }

  // Validate confidence.
  const confidence = Number(result.confidence);

  if (
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 100
  ) {
    throw new Error('Invalid confidence returned by Gemini.');
  }

  return {
    ...result,

    crop,

    confidence,

    isReliable: result.isReliable === true,

    visualEvidence: Array.isArray(result.visualEvidence)
      ? result.visualEvidence
      : [],

    recommendations: Array.isArray(result.recommendations)
      ? result.recommendations
      : [],

    uncertainty: result.uncertainty || null,

    stages,
  };
}

// ======================================================
// POST /api/analyze
// GEMINI GROWTH ANALYSIS + MONGODB SAVE
// ======================================================

router.post('/', upload.single('image'), async (req, res) => {
  let imageSaved = false;

  try {
    const cropInput =
      req.body.crop_type ||
      req.body.cropType ||
      'Tomato';

    const location =
      req.body.location ||
      'North Field';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a plant image.',
      });
    }

    const crop = normalizeCrop(cropInput);

    if (!CROP_STAGES[crop]) {
      return res.status(400).json({
        success: false,
        message: `Growth-stage prediction is not configured for ${cropInput}.`,
      });
    }

    // Analyze uploaded image using Gemini.
    const prediction = await analyzeGrowthImage(
      req.file.path,
      req.file.mimetype,
      crop
    );

    const stageIndex = prediction.stages.indexOf(
      prediction.stage
    );

    if (stageIndex === -1) {
      throw new Error(
        'The growth stage could not be identified.'
      );
    }

    const confidence = prediction.confidence;
    const isReliable = prediction.isReliable;

    console.log('Gemini growth prediction:', {
      crop,
      stage: prediction.stage,
      stageIndex,
      confidence,
      isReliable,
    });

    // Current stage.
    const currentStageObj = {
      id: stageIndex + 1,
      name: prediction.stage,
      code: createStageCode(prediction.stage),
    };

    // Previous stage.
    const previousStage =
      stageIndex > 0
        ? prediction.stages[stageIndex - 1]
        : 'Planting';

    // Next stage.
    const nextStage =
      stageIndex < prediction.stages.length - 1
        ? prediction.stages[stageIndex + 1]
        : 'Harvest Complete';

    // Stage progression.
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

    // Backend image URL.
    const imageUrl = `/uploads/${req.file.filename}`;

    // Generate an analysis plant identifier.
    const plantId =
      `PLT-${crop.slice(0, 3).toUpperCase()}-${Date.now()}`;

    // ==================================================
    // SAVE ANALYSIS IN MONGODB
    // ==================================================

    const savedAnalysis = await GrowthAnalysis.create({
      plantId,

      userId: req.user?._id || req.user?.id || null,

      cropType: cropInput,
      location,

      imageUrl,

      currentStage: currentStageObj.name,

      // Zero-based stage index.
      stageIndex,

      stageCode: currentStageObj.code,

      confidence: Number(confidence.toFixed(1)),

      // Health cannot be determined from growth stage alone.
      healthScore: null,

      previousStage,
      nextStage,

      // These require actual environmental measurements.
      daysToNextMilestone: null,
      estimatedNextMilestoneDate: null,
      accumulatedGDD: null,
      targetGDDToNext: null,

      visualCharacteristics: prediction.visualEvidence,

      recommendations: prediction.recommendations,

      uncertainty: prediction.uncertainty,

      isReliable,

      model: MODEL,

      stageProgression,
    });

    // Retain image only after successful database save.
    imageSaved = true;

    console.log(
      'Growth analysis saved to MongoDB:',
      savedAnalysis._id
    );

    // ==================================================
    // SEND RESPONSE TO FRONTEND
    // ==================================================

    return res.status(201).json({
      success: true,

      analysisId: savedAnalysis._id,

      plantId: savedAnalysis.plantId,

      cropType: savedAnalysis.cropType,

      location: savedAnalysis.location,

      timestamp: savedAnalysis.createdAt,

      imageUrl: savedAnalysis.imageUrl,

      currentStage: savedAnalysis.currentStage,

      stageIndex: savedAnalysis.stageIndex,

      stageCode: savedAnalysis.stageCode,

      confidence: savedAnalysis.confidence,

      healthScore: savedAnalysis.healthScore,

      previousStage: savedAnalysis.previousStage,

      nextStage: savedAnalysis.nextStage,

      daysToNextMilestone:
        savedAnalysis.daysToNextMilestone,

      estimatedNextMilestoneDate:
        savedAnalysis.estimatedNextMilestoneDate,

      accumulatedGDD: savedAnalysis.accumulatedGDD,

      targetGDDToNext: savedAnalysis.targetGDDToNext,

      visualCharacteristics:
        savedAnalysis.visualCharacteristics,

      recommendations:
        savedAnalysis.recommendations,

      uncertainty: savedAnalysis.uncertainty,

      isReliable: savedAnalysis.isReliable,

      model: savedAnalysis.model,

      stageProgression:
        savedAnalysis.stageProgression,
    });

  } catch (error) {
    console.error('Gemini growth analysis error:', error);

    // Delete uploaded image if analysis or database save fails.
    if (req.file && !imageSaved) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        console.error(
          'Uploaded image cleanup error:',
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Error processing plant image using Gemini.',
      error: error.message,
    });
  }
});

export default router;
