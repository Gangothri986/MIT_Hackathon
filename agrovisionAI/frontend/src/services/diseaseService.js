
import { apiClient } from './api.js';

const HISTORY_KEY = 'agrovision_disease_history';

export const diseaseService = {
  async detectDisease({ imageFile, imageUrl, cropType = 'Tomato' }) {
    try {
      const formData = new FormData();

      // User-uploaded image
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Preset sample image
      else if (imageUrl) {
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
          throw new Error('Unable to load the selected sample image.');
        }

        const blob = await imageResponse.blob();

        const extension = blob.type.split('/')[1] || 'jpg';

        const sampleFile = new File(
          [blob],
          `plant_sample.${extension}`,
          { type: blob.type || 'image/jpeg' }
        );

        formData.append('image', sampleFile);
      } else {
        throw new Error('Please select or upload a plant image.');
      }

      formData.append('crop_type', cropType);

      // Send image and crop type to backend.
      // Backend must save the diagnosis in MongoDB.
      const response = await apiClient.post(
        '/disease/detect',
        formData
      );

      const data = response.data;

      if (!data) {
        throw new Error('Invalid response received from the server.');
      }

      // Prepare result for frontend display.
      const result = {
        ...data,
        imageUrl: data.imageUrl  || null,
      };

      // Keep a browser fallback copy.
      // MongoDB persistence must happen in the backend.
      const logEntry = {
        id: data.logId || data._id,
        date: data.createdAt || new Date().toISOString(),
        plantId: data.plantId || 'N/A',
        crop: data.crop || cropType,
        diseaseName: data.name || 'Unknown',
        severity: data.severity || 'Unknown',
        confidence: data.confidence ?? 0,
        status: data.isHealthy ? 'Healthy' : 'Infected',
        treatmentStatus: data.isHealthy
          ? 'Normal Monitoring'
          : 'Action Recommended',
        imageUrl: result.imageUrl,
      };

      const existingHistory = this.getLocalDiseaseHistory();

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
          [logEntry, ...existingHistory]
            .filter((item, index, array) =>
              array.findIndex(
                (entry) => entry.id === item.id
              ) === index
            )
            .slice(0, 20)
        )
      );

      return {
        ...result,
        logEntry,
      };

    } catch (error) {
      console.error('Disease detection failed:', error);

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Unable to analyze the plant image.'
      );
    }
  },

  // Fetch actual diagnosis history from MongoDB.
  async getDiseaseHistory() {
    try {
      const response = await apiClient.get('/disease/history');

      const history = Array.isArray(response.data)
  ? response.data
  : response.data.history || [];

      return history.map((item) => ({
        ...item,
        id: item._id || item.id,
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : item.date,
        diseaseName: item.diseaseName || item.name,
        status: item.status ||
          (item.isHealthy ? 'Healthy' : 'Infected'),
      }));

    } catch (error) {
      console.error('Unable to fetch MongoDB disease history:', error);

      // Fallback for displaying previously cached browser history.
      return this.getLocalDiseaseHistory();
    }
  },

  getLocalDiseaseHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  },
};
