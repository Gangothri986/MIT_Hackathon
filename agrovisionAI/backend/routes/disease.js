
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { DiseaseRecord } from '../models/DiseaseRecord.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// UPLOAD DIRECTORY
// --------------------------------------------------

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --------------------------------------------------
// GEMINI CONFIGURATION
// --------------------------------------------------

const MODEL = 'gemini-3.5-flash-lite';

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'Gemini API key is missing. Check your backend .env file.'
    );
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

// --------------------------------------------------
// GEMINI RETRY HANDLER
// --------------------------------------------------

async function generateWithRetry(ai, request, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Gemini disease analysis: attempt ${attempt}/${maxAttempts}`
      );

      return await ai.models.generateContent(request);

    } catch (error) {
      const status = Number(error.status || error.code);

      const temporaryError = [429, 500, 503, 504].includes(status);

      if (!temporaryError || attempt === maxAttempts) {
        throw error;
      }

      const delay = attempt * 3000;

      console.log(
        `Gemini temporarily unavailable (${status}). Retrying in ${
          delay / 1000
        } seconds...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    'Gemini analysis failed after multiple attempts.'
  );
}

// --------------------------------------------------
// MULTER CONFIGURATION
// --------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';

    const uniqueName = `disease_${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only JPG, PNG and WEBP images are allowed.')
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

// --------------------------------------------------
// SUPPORTED CROPS
// --------------------------------------------------

const allowedCrops = [
  'Rice',
  'Paddy',
  'Wheat',
  'Sweet Potato',
  'Cotton',
  'Chilli',
  'Tomato',
];

// --------------------------------------------------
// GEMINI RESPONSE SCHEMA
// --------------------------------------------------

const diseaseResponseSchema = {
  type: 'object',

  properties: {
    crop: {
      type: 'string',
    },

    name: {
      type: 'string',
    },

    alternativeDiagnosis: {
      type: 'string',
    },

    isHealthy: {
      type: 'boolean',
    },

    severity: {
      type: 'string',
      enum: ['None', 'Low', 'Medium', 'High'],
    },

    confidence: {
      type: 'number',
    },

    pathogenType: {
      type: 'string',
    },

    affectedParts: {
      type: 'string',
    },

    symptoms: {
      type: 'array',
      items: {
        type: 'string',
      },
    },

    organicManagement: {
      type: 'array',
      items: {
        type: 'string',
      },
    },

    chemicalTreatment: {
      type: 'array',
      items: {
        type: 'string',
      },
    },

    preventiveMeasures: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },

  required: [
    'crop',
    'name',
    'alternativeDiagnosis',
    'isHealthy',
    'severity',
    'confidence',
    'pathogenType',
    'affectedParts',
    'symptoms',
    'organicManagement',
    'chemicalTreatment',
    'preventiveMeasures',
  ],
};

// --------------------------------------------------
// DISEASE DETECTION
// POST /api/disease/detect
// --------------------------------------------------

router.post(
  '/detect',
  upload.single('image'),
  async (req, res) => {
    let recordSaved = false;

    try {
      // Check MongoDB connection.
      if (mongoose.connection.readyState !== 1) {
        throw new Error(
          'MongoDB is not connected. Check your database connection.'
        );
      }

      // Check Gemini API key.
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing.');
      }

      // Check uploaded image.
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a plant image.',
        });
      }

      // Read form fields.
      const requestedCrop = String(
        req.body.crop_type || 'Tomato'
      ).trim();

      const cropType =
        requestedCrop === 'Paddy' ? 'Rice' : requestedCrop;

      const language =
        req.body.language === 'kn' ? 'kn' : 'en';

      const farmerQuery = String(
        req.body.farmer_query || ''
      )
        .trim()
        .slice(0, 1000);

      // Validate crop.
      if (!allowedCrops.includes(requestedCrop)) {
        return res.status(400).json({
          success: false,
          message:
            'Unsupported crop. Choose Rice, Wheat, Sweet Potato, Cotton, Chilli or Tomato.',
        });
      }

      // Image URL.
      const imageUrl = `/uploads/${req.file.filename}`;

      // Read uploaded image.
      const imageBuffer = fs.readFileSync(req.file.path);

      const base64Image = imageBuffer.toString('base64');

      // --------------------------------------------------
      // GEMINI DISEASE DETECTION PROMPT
      // --------------------------------------------------

      const prompt = `
You are an AI-assisted agricultural plant disease screening assistant.

Analyze the actual attached plant photograph carefully.

SELECTED CROP: ${cropType}

FARMER'S ADDITIONAL DESCRIPTION:
${farmerQuery || 'No additional description provided.'}

RESPONSE LANGUAGE:

${language === 'kn'
  ? 'Kannada (ಕನ್ನಡ)'
  : 'English'}

Return ALL human-readable text values in the selected response language.

This includes:
- name
- alternativeDiagnosis
- pathogenType
- affectedParts
- symptoms
- organicManagement
- chemicalTreatment
- preventiveMeasures

If Kannada is selected:
- Write naturally in Kannada script.
- Use simple Kannada that farmers can understand.
- Keep scientific disease names where useful, with Kannada explanations.
- Give practical recommendations in Kannada.

If English is selected:
- Use clear, simple English.

Keep these fields unchanged in format:
- isHealthy must remain boolean.
- confidence must remain a number from 0 to 100.
- severity must remain one of: None, Low, Medium, High.
- crop must remain the selected crop name in English.

Use the farmer's description as additional context.
Base the diagnosis primarily on the attached photograph.
Do not accept a farmer's guess as proof of a disease.

SUPPORTED CROPS:
- Rice
- Wheat
- Sweet Potato
- Cotton
- Chilli
- Tomato

DIAGNOSTIC RULES:

1. Analyze the actual image. Never identify a disease based only on the selected crop.

2. Identify ONE most likely primary disease.
   Put only that disease name in the name field.
   Never combine multiple diseases using "or".

3. If another disease is visually possible, mention it separately
   in alternativeDiagnosis.

4. Differentiate diseases using characteristic visible symptoms.
   For example, distinguish Septoria leaf spot from early blight.
   Do not identify early blight solely because brown spots are present.
   Look for characteristic concentric target-like rings.

5. Describe only symptoms that are actually visible.
   Do not invent symptoms, affected parts or pathogen details.

6. If the photograph is unclear, insufficient or not a plant,
   explain this limitation in the diagnosis.
   Do not confidently claim a disease without sufficient evidence.

7. Confidence must be a NUMBER from 0 to 100.
   Return 88 for 88% confidence, NOT 0.88.
   Confidence is an approximate AI assessment, not a scientifically
   calibrated probability.

8. Severity:
   - None: Plant appears healthy.
   - Low: Few visible symptoms.
   - Medium: Noticeable symptoms affecting multiple areas.
   - High: Extensive visible damage.

9. If the plant appears healthy:
   - Set isHealthy to true.
   - Set severity to None.
   - Set name to "No visible disease detected" in the selected language.

10. If a disease is suspected:
    - Set isHealthy to false.
    - Identify the most likely disease.
    - Explain uncertainty if the evidence is insufficient.

11. Keep recommendations practical and crop-specific.

12. Do not provide chemical dosages.
    Recommend following locally approved product labels and consulting
    an agricultural expert before chemical application.

13. Do not invent treatment products or claim that a treatment
    guarantees recovery.

Return only valid JSON matching the required schema.
`;

      // --------------------------------------------------
      // CALL GEMINI WITH RETRIES
      // --------------------------------------------------

      const ai = getAI();

      const response = await generateWithRetry(ai, {
        model: MODEL,

        contents: [
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],

        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: diseaseResponseSchema,
        },
      });

      // --------------------------------------------------
      // PARSE GEMINI RESPONSE
      // --------------------------------------------------

      if (!response || !response.text) {
        throw new Error(
          'Gemini returned an empty response.'
        );
      }

      const matched = JSON.parse(response.text);

      if (
        typeof matched.isHealthy !== 'boolean' ||
        !matched.name ||
        !['None', 'Low', 'Medium', 'High'].includes(
          matched.severity
        )
      ) {
        throw new Error(
          'Gemini returned an invalid diagnosis.'
        );
      }

      // Normalize confidence.
      let confidence = Number(matched.confidence);

      if (!Number.isFinite(confidence)) {
        confidence = 0;
      }

      if (confidence > 0 && confidence <= 1) {
        confidence *= 100;
      }

      matched.confidence = Math.max(
        0,
        Math.min(100, confidence)
      );

      // Healthy plant severity.
      if (matched.isHealthy) {
        matched.severity = 'None';
      }

      // Ensure arrays exist.
      matched.symptoms = Array.isArray(matched.symptoms)
        ? matched.symptoms
        : [];

      matched.organicManagement = Array.isArray(
        matched.organicManagement
      )
        ? matched.organicManagement
        : [];

      matched.chemicalTreatment = Array.isArray(
        matched.chemicalTreatment
      )
        ? matched.chemicalTreatment
        : [];

      matched.preventiveMeasures = Array.isArray(
        matched.preventiveMeasures
      )
        ? matched.preventiveMeasures
        : [];

      // --------------------------------------------------
      // GENERATE RECORD IDS
      // --------------------------------------------------

      const logId = `DIS-LOG-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const plantId = `PLT-${cropType
        .slice(0, 3)
        .toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      // --------------------------------------------------
      // SAVE DIAGNOSIS TO MONGODB
      // --------------------------------------------------

      const record = new DiseaseRecord({
        logId,
        plantId,

        crop: cropType,

        diseaseName: matched.name,

        alternativeDiagnosis:
          matched.alternativeDiagnosis || '',

        isHealthy: matched.isHealthy,

        severity: matched.severity,

        confidence: matched.confidence,

        pathogenType: matched.pathogenType || '',

        affectedParts: matched.affectedParts || '',

        status: matched.isHealthy
          ? 'Healthy'
          : 'Infected',

        treatmentStatus: matched.isHealthy
          ? 'Normal Monitoring'
          : 'Action Recommended',

        imageUrl,

        symptoms: matched.symptoms,

        organicManagement: matched.organicManagement,

        chemicalTreatment: matched.chemicalTreatment,

        preventiveMeasures: matched.preventiveMeasures,

        // Additional voice/language context.
        language,
        farmerQuery,

        date: new Date(),

        userId: req.user?._id || null,
      });

      // Save before returning success.
      await record.save();

      recordSaved = true;

      console.log(
        `Disease diagnosis saved successfully. MongoDB ID: ${record._id}`
      );

      // --------------------------------------------------
      // RETURN RESULT TO FRONTEND
      // --------------------------------------------------

      return res.status(200).json({
        success: true,

        ...matched,

        _id: record._id,

        logId: record.logId,

        plantId: record.plantId,

        timestamp: record.createdAt,

        imageUrl: record.imageUrl,

        language,

        farmerQuery,
      });

    } catch (error) {
      console.error(
        'Disease detection error:',
        error
      );

      // Delete image if diagnosis was not saved.
      if (req.file && !recordSaved) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);

            console.log(
              'Unused uploaded image cleaned up.'
            );
          }
        } catch (cleanupError) {
          console.error(
            'Image cleanup error:',
            cleanupError.message
          );
        }
      }

      const status = Number(
        error.status || error.code
      );

      if ([429, 500, 503, 504].includes(status)) {
        return res.status(503).json({
          success: false,
          message:
            'Gemini is temporarily unavailable. Please try again.',
        });
      }

      return res.status(500).json({
        success: false,
        message:
          'Unable to analyze or save the plant diagnosis.',
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// GET DISEASE HISTORY
// GET /api/disease/history
// --------------------------------------------------

router.get('/history', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected.',
      });
    }

    const history = await DiseaseRecord.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json(history);

  } catch (error) {
    console.error(
      'Disease history error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Error retrieving disease history.',
    });
  }
});

// --------------------------------------------------
// GET SINGLE DISEASE RECORD
// GET /api/disease/:id
// --------------------------------------------------

router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid disease record ID.',
      });
    }

    const record = await DiseaseRecord.findById(
      req.params.id
    ).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Disease record not found.',
      });
    }

    return res.status(200).json(record);

  } catch (error) {
    console.error(
      'Disease record retrieval error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve disease record.',
    });
  }
});

export default router;
