
import { apiClient } from './api.js';

export const CROP_GDD_CONFIG = {
  Tomato: {
    baseTemp: 10,
    gddMilestones: {
      Seedling: 150,
      'Vegetative Growth': 400,
      'Bud Formation': 600,
      Flowering: 750,
      'Fruit Development': 1100,
      Ripening: 1400,
    },
    optimalTempRange: '21°C - 29°C',
    humidityRange: '60% - 75%',
  },

  Chilli: {
    baseTemp: 12,
    gddMilestones: {
      Seedling: 180,
      'Vegetative Growth': 450,
      Flowering: 850,
      'Fruit Development': 1200,
      Maturity: 1550,
    },
    optimalTempRange: '22°C - 30°C',
    humidityRange: '55% - 70%',
  },

  Paddy: {
    baseTemp: 10,
    gddMilestones: {
      Seedling: 200,
      Tillering: 550,
      Booting: 780,
      Heading: 950,
      'Grain Filling': 1250,
      Maturity: 1600,
    },
    optimalTempRange: '24°C - 33°C',
    humidityRange: '70% - 85%',
  },

  Wheat: {
    baseTemp: 5,
    gddMilestones: {
      Emergence: 150,
      Tillering: 400,
      'Stem Elongation': 600,
      Heading: 850,
      'Grain Filling': 1100,
      Maturity: 1400,
    },
    optimalTempRange: '15°C - 25°C',
    humidityRange: '50% - 70%',
  },

  Other: {
    baseTemp: 10,
    gddMilestones: {
      Seedling: 160,
      'Vegetative Growth': 420,
      Flowering: 800,
      Maturity: 1450,
    },
    optimalTempRange: '20°C - 30°C',
    humidityRange: '60% - 75%',
  },
};

export const predictionService = {

  // ====================================================
  // GEMINI MULTI-CROP GROWTH-STAGE ANALYSIS
  // POST /api/analyze
  // ====================================================

  async analyzeGrowthStage({
    imageFile,
    imageUrl,
    cropType = 'Tomato',
    location = 'North Field',
  }) {
    if (!imageFile) {
      throw new Error(
        'Please upload an actual plant image before analysing.'
      );
    }

    const formData = new FormData();

    formData.append('image', imageFile);
    formData.append('crop_type', cropType);
    formData.append('location', location);

    try {
      const response = await apiClient.post(
        '/analyze',
        formData
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Growth-stage analysis failed.'
        );
      }

      return {
        ...response.data,
        imageUrl: imageUrl || response.data.imageUrl,
        predictionSource: 'Gemini AI',
      };

    } catch (error) {
  console.error('Gemini growth-stage API error:', error);

  console.error(
    'Backend response:',
    error.response?.data
  );

  throw new Error(
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Plant analysis failed.'
  );
}
  },

  // ====================================================
  // GEMINI PLANT PREDICTION AND MONGODB UPDATE
  // POST /api/plants/:id/predict-growth-stage
  // ====================================================

  async predictWheatStage(plantId, imageFile) {
    if (!plantId) {
      throw new Error('Plant ID is required.');
    }

    if (!imageFile) {
      throw new Error('Please upload a plant image.');
    }

    const formData = new FormData();

    formData.append('image', imageFile);

    try {
      const response = await apiClient.post(
        `/plants/${plantId}/predict-growth-stage`,
        formData
      );

      return response.data;

    } catch (error) {
      console.error('Plant growth-stage prediction error:', error);

      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Unable to predict plant growth stage.'
      );
    }
  },
};
