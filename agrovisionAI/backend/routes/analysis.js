import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const GROWTH_STAGES = [
  { id: 1, name: 'Seedling', code: 'seedling', durationDays: 14 },
  { id: 2, name: 'Vegetative Growth', code: 'vegetative', durationDays: 25 },
  { id: 3, name: 'Bud Formation', code: 'bud_formation', durationDays: 12 },
  { id: 4, name: 'Flowering', code: 'flowering', durationDays: 18 },
  { id: 5, name: 'Fruit Formation', code: 'fruit_formation', durationDays: 28 },
  { id: 6, name: 'Maturity / Harvesting', code: 'maturity', durationDays: 15 },
];

// POST /api/analyze - AI growth stage classification endpoint
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { crop_type = 'Tomato', location = 'North Field' } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Stage simulation based on crop type
    let stageIndex = 4; // Default Flowering
    if (crop_type.toLowerCase() === 'chilli') stageIndex = 2;
    if (crop_type.toLowerCase() === 'paddy') stageIndex = 5;

    const currentStageObj = GROWTH_STAGES[stageIndex - 1];
    const prevStageObj = stageIndex > 1 ? GROWTH_STAGES[stageIndex - 2] : null;
    const nextStageObj = stageIndex < GROWTH_STAGES.length ? GROWTH_STAGES[stageIndex] : null;

    const confidence = Number((92 + Math.random() * 5).toFixed(1));
    const daysToNext = nextStageObj ? Math.round(nextStageObj.durationDays * 0.6) : 0;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToNext);

    const visualCharacteristics = [
      `Identified ${currentStageObj.name} characteristics with ${confidence}% confidence`,
      `Healthy leaf growth and stem branching observed`,
      `Good plant vigor and rich green foliage color`,
      `Foliar canopy development is right on track for this season`,
    ];

    const recommendations = [
      stageIndex === 4
        ? 'Maintain steady soil moisture; avoid heavy overhead watering to protect delicate flowers.'
        : stageIndex === 2
        ? 'Provide balanced fertilizer/manure to support leafy branch expansion.'
        : stageIndex === 5
        ? 'Ensure regular watering and potassium-rich nutrition to support good fruit size.'
        : 'Continue normal watering and routine farm checks.',
      'Take another photo in 7-10 days to track milestone progress.',
    ];

    res.json({
      success: true,
      plantId: `PLT-${crop_type.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      cropType: crop_type,
      location,
      timestamp: new Date().toISOString(),
      imageUrl,
      currentStage: currentStageObj.name,
      stageIndex,
      stageCode: currentStageObj.code,
      confidence,
      healthScore: stageIndex === 4 ? 92 : 88,
      previousStage: prevStageObj ? prevStageObj.name : 'Planting',
      nextStage: nextStageObj ? nextStageObj.name : 'Harvest Complete',
      daysToNextMilestone: daysToNext,
      estimatedNextMilestoneDate: nextDate.toISOString().split('T')[0],
      accumulatedGDD: 680,
      targetGDDToNext: 1100,
      visualCharacteristics,
      recommendations,
      stageProgression: GROWTH_STAGES.map((s, idx) => ({
        ...s,
        isCompleted: idx + 1 < stageIndex,
        isCurrent: idx + 1 === stageIndex,
        isUpcoming: idx + 1 > stageIndex,
      })),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Error processing plant image' });
  }
});

export default router;
