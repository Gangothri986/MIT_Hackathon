import express from 'express';
import { Plant } from '../models/Plant.js';

const router = express.Router();

// GET /api/plants - list plants with filters
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
    res.status(500).json({ message: 'Error retrieving plant records' });
  }
});

// GET /api/plants/:id - get single plant
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findOne({
      $or: [{ customId: req.params.id }, { _id: req.params.id }],
    });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving plant' });
  }
});

// POST /api/plants - register new plant
router.post('/', async (req, res) => {
  try {
    const { name, cropType, variety, location, plantedDate, currentStage, imageUrl } = req.body;

    const daysAfterPlanting = Math.max(
      1,
      Math.floor((new Date() - new Date(plantedDate || Date.now())) / (1000 * 60 * 60 * 24))
    );

    const customId = `PLT-${(cropType || 'CRP').slice(0, 3).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newPlant = new Plant({
      customId,
      name,
      cropType: cropType || 'Tomato',
      variety: variety || 'Commercial Variety',
      location: location || 'North Field Bed 1',
      plantedDate: plantedDate || new Date().toISOString().split('T')[0],
      daysAfterPlanting,
      currentStage: currentStage || 'Vegetative Growth',
      stageIndex: 2,
      confidence: 93.5,
      healthStatus: 'Healthy',
      healthScore: 90,
      riskLevel: 'Low',
      lastAnalysedDate: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || '',
      soilMoisture: '30%',
      gddAccumulated: 400,
      estimatedNextMilestone: {
        stage: 'Bud Formation',
        estimatedDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        daysRemaining: 10,
        confidence: 89,
      },
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          stage: currentStage || 'Vegetative Growth',
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
    res.status(500).json({ message: 'Error registering plant' });
  }
});

// PUT /api/plants/:id - update plant
router.put('/:id', async (req, res) => {
  try {
    const updated = await Plant.findOneAndUpdate(
      { $or: [{ customId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Plant not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plant' });
  }
});

// DELETE /api/plants/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Plant.findOneAndDelete({
      $or: [{ customId: req.params.id }, { _id: req.params.id }],
    });
    if (!deleted) return res.status(404).json({ message: 'Plant not found' });
    res.json({ message: 'Plant record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plant' });
  }
});

export default router;
