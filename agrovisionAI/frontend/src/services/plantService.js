import { apiClient } from './api.js';
import { IMAGES } from '../assets/images/index.js';

export const GROWTH_STAGES = [
  { id: 1, name: 'Seedling', code: 'seedling', durationDays: 14, description: 'Cotyledons emerged, primary root elongation, initial leaf pair developing.' },
  { id: 2, name: 'Vegetative Growth', code: 'vegetative', durationDays: 25, description: 'Rapid foliar canopy expansion, active stem branching, root biomass multiplication.' },
  { id: 3, name: 'Bud Formation', code: 'bud_formation', durationDays: 12, description: 'Flower buds visible on terminal apical nodes; high phosphorus requirement.' },
  { id: 4, name: 'Flowering', code: 'flowering', durationDays: 18, description: 'Anthesis active, pollination window open, sensitive to heat stress above 34°C.' },
  { id: 5, name: 'Fruit Formation', code: 'fruit_formation', durationDays: 28, description: 'Fruit set developing, rapid cell expansion, high potassium and uniform water need.' },
  { id: 6, name: 'Maturity / Harvesting', code: 'maturity', durationDays: 15, description: 'Pigmentation change, starch to sugar conversion, harvest ready.' },
];

export const INITIAL_PLANTS = [
  {
    id: 'PLT-TOM-204',
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
    imageUrl: IMAGES.tomatoFlowering,
    soilMoisture: '34%',
    gddAccumulated: 680,
    gddTargetFlowering: 650,
    gddTargetMaturity: 1350,
    estimatedNextMilestone: {
      stage: 'Fruit Formation',
      estimatedDate: '2026-11-12',
      daysRemaining: 8,
      confidence: 91.2,
    },
    observations: [
      'Abundant yellow floral clusters (7-9 flowers per truss)',
      'Uniform internode spacing (~4.2 cm) indicating balanced nutrition',
      'No signs of chlorosis or leaf curl on new growth flushes',
    ],
    history: [
      {
        date: '2026-09-15',
        stage: 'Seedling',
        healthScore: 95,
        imageUrl: IMAGES.tomatoFlowering,
        note: 'Transplanted nursery plug seedlings to bed.',
      },
      {
        date: '2026-10-05',
        stage: 'Vegetative Growth',
        healthScore: 90,
        imageUrl: IMAGES.tomatoFlowering,
        note: 'Rapid canopy fill, secondary suckers pruned.',
      },
      {
        date: '2026-10-24',
        stage: 'Bud Formation',
        healthScore: 91,
        imageUrl: IMAGES.tomatoFlowering,
        note: 'First flower trusses identified on apical shoots.',
      },
      {
        date: '2026-11-03',
        stage: 'Flowering',
        healthScore: 92,
        imageUrl: IMAGES.tomatoFlowering,
        note: 'Full flowering confirmed. High pollinator activity.',
      },
    ],
  },
  {
    id: 'PLT-CHL-108',
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
    imageUrl: IMAGES.chilliVegetative,
    soilMoisture: '28%',
    gddAccumulated: 420,
    gddTargetFlowering: 580,
    gddTargetMaturity: 1400,
    estimatedNextMilestone: {
      stage: 'Bud Formation',
      estimatedDate: '2026-11-14',
      daysRemaining: 10,
      confidence: 88.5,
    },
    observations: [
      'Dense lateral branching initiated after apical pinching',
      'Dark green glossy foliage with rich chlorophyll content',
      'Soil moisture near 28% suggests drip irrigation cycle recommended',
    ],
    history: [
      {
        date: '2026-10-01',
        stage: 'Seedling',
        healthScore: 94,
        imageUrl: IMAGES.chilliVegetative,
        note: 'Germination 96% in organic bed.',
      },
      {
        date: '2026-10-20',
        stage: 'Vegetative Growth',
        healthScore: 89,
        imageUrl: IMAGES.chilliVegetative,
        note: 'Primary shoot elongation, robust taproot anchorage.',
      },
    ],
  },
  {
    id: 'PLT-PAD-032',
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
    imageUrl: IMAGES.paddyField,
    soilMoisture: 'Flooded (4 cm ponded water)',
    gddAccumulated: 980,
    gddTargetFlowering: 850,
    gddTargetMaturity: 1300,
    estimatedNextMilestone: {
      stage: 'Maturity / Harvesting',
      estimatedDate: '2026-11-28',
      daysRemaining: 24,
      confidence: 93.4,
    },
    observations: [
      'Panicles emerged and bending under milky-dough grain fill',
      'Slight fungal spot on lower leaves due to standing humidity',
      'Grain panicle count averages 260 grains per hill',
    ],
    history: [
      {
        date: '2026-09-01',
        stage: 'Seedling',
        healthScore: 96,
        imageUrl: IMAGES.paddyField,
        note: 'Transplantation at 25cm x 25cm spacing.',
      },
      {
        date: '2026-09-28',
        stage: 'Vegetative Growth',
        healthScore: 92,
        imageUrl: IMAGES.paddyField,
        note: 'Max tillering reached (32 tillers/hill).',
      },
      {
        date: '2026-10-18',
        stage: 'Flowering',
        healthScore: 86,
        imageUrl: IMAGES.paddyField,
        note: 'Heading and 50% anthesis.',
      },
      {
        date: '2026-11-04',
        stage: 'Fruit Formation',
        healthScore: 78,
        imageUrl: IMAGES.paddyField,
        note: 'Grain filling stage; organic spot treatment applied.',
      },
    ],
  },
  {
    id: 'PLT-TOM-088',
    name: 'Tomato - Open Field Row 12',
    cropType: 'Tomato',
    variety: 'Local Table Variety',
    location: 'West Plot Open Field',
    plantedDate: '2026-09-20',
    daysAfterPlanting: 45,
    currentStage: 'Bud Formation',
    stageIndex: 3,
    confidence: 95.1,
    healthStatus: 'Diseased',
    healthScore: 64,
    riskLevel: 'High',
    lastAnalysedDate: '2026-11-04',
    imageUrl: IMAGES.leafDisease,
    soilMoisture: '31%',
    gddAccumulated: 610,
    gddTargetFlowering: 660,
    gddTargetMaturity: 1380,
    estimatedNextMilestone: {
      stage: 'Flowering',
      estimatedDate: '2026-11-09',
      daysRemaining: 5,
      confidence: 89.0,
    },
    observations: [
      'Concentric target-like brown necrotic spots identified on lower leaves',
      'Diagnosis matches Early Blight fungal infection at moderate severity',
      'Upper canopy remains vigorous with healthy floral buds emerging',
    ],
    history: [
      {
        date: '2026-09-20',
        stage: 'Seedling',
        healthScore: 95,
        imageUrl: IMAGES.leafDisease,
        note: 'Healthy germination in seedling tray.',
      },
      {
        date: '2026-10-14',
        stage: 'Vegetative Growth',
        healthScore: 88,
        imageUrl: IMAGES.leafDisease,
        note: 'Trellised with stakes.',
      },
      {
        date: '2026-11-04',
        stage: 'Bud Formation',
        healthScore: 64,
        imageUrl: IMAGES.leafDisease,
        note: 'Early blight fungal lesions diagnosed on lower leaves.',
      },
    ],
  },
];


export const plantService = {
  // GET ALL PLANTS FROM MONGODB
  async getPlants(filters = {}) {
    const response = await apiClient.get('/plants', {
      params: filters,
    });

    return Array.isArray(response.data) ? response.data : [];
  },

  // GET ONE PLANT
  async getPlantById(id) {
    const response = await apiClient.get(`/plants/${id}`);
    return response.data;
  },

  // REGISTER NEW PLANT
  async createPlant(plantData) {
  const response = await apiClient.post('/plants', plantData);

  if (!response.data?.plant?._id) {
    throw new Error('Plant was not saved in MongoDB.');
  }

  return response.data.plant;
},

  // UPDATE EXISTING PLANT AND ITS GROWTH HISTORY
  async updatePlant(id, updateData) {
    const response = await apiClient.put(
      `/plants/${id}`,
      updateData
    );

    if (!response.data?._id) {
      throw new Error('Plant update was not confirmed by MongoDB.');
    }

    return response.data;
  },
};


export const predictionService = {
  async analyzeGrowthStage({ imageFile, cropType, location }) {
    if (!imageFile) {
      throw new Error('Please select a plant image.');
    }

    const formData = new FormData();

    // Must match upload.single('image') in analysis.js
    formData.append('image', imageFile);

    // These names are accepted by the updated analysis.js
    formData.append('crop_type', cropType);
    formData.append('location', location || 'North Field');

    const response = await apiClient.post(
      '/analyze',
      formData
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Growth analysis failed.'
      );
    }

    return response.data;
  },
};

