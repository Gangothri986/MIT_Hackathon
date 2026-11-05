
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { DiseaseRecord } from '../models/DiseaseRecord.js';

const router = express.Router();

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `disease_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

const allowedCrops = ['Tomato', 'Chilli', 'Paddy'];

// POST /api/disease/detect
router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: 'Gemini API key is missing. Check your backend .env file.',
      });
    }

    // Check uploaded image
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a plant image.',
      });
    }

    // Validate crop
    const cropType = req.body.crop_type || 'Tomato';

    if (!allowedCrops.includes(cropType)) {
      return res.status(400).json({
        message: 'Unsupported crop. Choose Tomato, Chilli or Paddy.',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Read uploaded image
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Improved Gemini prompt
    const prompt = `
You are an AI-assisted agricultural plant disease screening assistant.

Analyze the actual attached plant photograph carefully.

Selected crop: ${cropType}

Your task is to identify visible plant health problems.

SUPPORTED CROPS:
- Tomato
- Chilli
- Paddy (Rice)

DIAGNOSTIC RULES:

1. Analyze the actual image. Never identify a disease based only on the selected crop.

2. Identify ONE most likely primary disease.
   Put only that disease name in the "name" field.
   Never combine multiple diseases using "or".

3. If another disease is also visually possible, mention it separately
   in "alternativeDiagnosis".

4. Differentiate diseases using their characteristic visible symptoms.
   For example, distinguish Septoria leaf spot from early blight.
   Do not identify early blight solely because brown spots are present.
   Look for characteristic concentric target-like rings.

5. Describe only symptoms that are actually visible.
   Do not invent symptoms, affected parts or pathogen details.

6. If the photograph is unclear, insufficient or not a plant,
   explain this limitation in the diagnosis.

7. Confidence must be a NUMBER from 0 to 100.
   IMPORTANT: Return 88 for 88% confidence, NOT 0.88.
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
   - Set name to "No visible disease detected".

10. If a disease is suspected:
    - Set isHealthy to false.
    - Identify the most likely disease.
    - Explain uncertainty if the evidence is insufficient.

11. Keep recommendations practical and crop-specific.

12. Do not provide chemical dosages.
    Recommend following locally approved product labels and consulting
    an agricultural expert before chemical application.

Return only valid JSON matching the required schema.
`;

    // Send image to Gemini with automatic retry
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
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
            responseJsonSchema: {
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
            },
          },
        });

        break;
      } catch (error) {
        attempts++;

        if (error.status !== 503 || attempts >= maxAttempts) {
          throw error;
        }

        console.log(
          `Gemini temporarily unavailable. Retry ${attempts}/2...`
        );

        await new Promise(resolve =>
          setTimeout(resolve, attempts * 3000)
        );
      }
    }

    // Parse Gemini response
    if (!response || !response.text) {
      throw new Error('Gemini returned an empty response.');
    }

    const matched = JSON.parse(response.text);

    // Normalize confidence into percentage (0-100)
    let confidence = Number(matched.confidence) || 0;

    if (confidence > 0 && confidence <= 1) {
      confidence = confidence * 100;
    }

    matched.confidence = Math.max(
      0,
      Math.min(100, confidence)
    );

    // Ensure healthy plants have None severity
    if (matched.isHealthy) {
      matched.severity = 'None';
    }

    // Generate record IDs
    const logId = `DIS-LOG-${Math.floor(100 + Math.random() * 900)}`;

    const plantId = `PLT-${cropType.slice(0, 3).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Save diagnosis in MongoDB
    const record = new DiseaseRecord({
      logId,
      plantId,
      crop: cropType,
      diseaseName: matched.name,
      severity: matched.severity,
      confidence: matched.confidence,
      status: matched.isHealthy ? 'Healthy' : 'Infected',
      treatmentStatus: matched.isHealthy
        ? 'Normal Monitoring'
        : 'Action Recommended',
      imageUrl,
      symptoms: matched.symptoms,
      organicManagement: matched.organicManagement,
      chemicalTreatment: matched.chemicalTreatment,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    try {
      await record.save();
      console.log('Disease diagnosis saved to MongoDB.');
    } catch (saveError) {
      console.error('MongoDB save error:', saveError.message);
    }

    // Send result to frontend
    res.json({
      ...matched,
      logId,
      plantId,
      timestamp: new Date().toISOString(),
      imageUrl,
    });

  } catch (error) {
    console.error('Gemini disease detection error:', error);

    res.status(500).json({
      message: 'Unable to analyze the plant image.',
      error: error.message,
    });
  }
});

// GET /api/disease/history
router.get('/history', async (req, res) => {
  try {
    const history = await DiseaseRecord.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(history);
  } catch (error) {
    console.error('Disease history error:', error);

    res.status(500).json({
      message: 'Error retrieving disease history',
    });
  }
});

export default router;
