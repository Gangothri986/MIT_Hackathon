
import { apiClient } from './api.js';

const HISTORY_KEY = 'agrovision_disease_history';

export const diseaseService = {
  async detectDisease({
    imageFile,
    imageUrl,
    cropType = 'Tomato',
    language = 'en',
    farmerQuery = '',
  }) {
    try {
      const formData = new FormData();

      // 1. Attach uploaded image or selected sample image.
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
          throw new Error(
            'Unable to load the selected sample image.'
          );
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
        throw new Error(
          'Please select or upload a plant image.'
        );
      }

      // 2. Attach crop and language information.
      formData.append('crop_type', cropType);
      formData.append('language', language);
      formData.append('farmer_query', farmerQuery.trim());

      // 3. Send request to backend.
      const response = await apiClient.post(
        '/disease/detect',
        formData
      );

      const data = response.data;

      if (!data) {
        throw new Error(
          'Invalid response received from the server.'
        );
      }

      // 4. Prepare diagnosis result.
      const result = {
        ...data,
        imageUrl: data.imageUrl || null,
      };

      // 5. Prepare local history fallback.
      const logEntry = {
        id:
          data.logId ||
          data._id ||
          `local-${Date.now()}`,

        date:
          data.createdAt ||
          data.timestamp ||
          new Date().toISOString(),

        plantId: data.plantId || 'N/A',
        crop: data.crop || cropType,

        diseaseName:
          data.name ||
          data.diseaseName ||
          'Unknown',

        severity: data.severity || 'Unknown',
        confidence: data.confidence ?? 0,

        status: data.isHealthy
          ? 'Healthy'
          : 'Infected',

        treatmentStatus: data.isHealthy
          ? 'Normal Monitoring'
          : 'Action Recommended',

        imageUrl: result.imageUrl,
      };

      // 6. Save a browser fallback copy.
      // Actual permanent history is saved by the backend in MongoDB.
      const existingHistory = this.getLocalDiseaseHistory();

      const updatedHistory = [
        logEntry,
        ...existingHistory,
      ]
        .filter(
          (item, index, array) =>
            array.findIndex(
              (entry) => entry.id === item.id
            ) === index
        )
        .slice(0, 20);

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

      return {
        ...result,
        logEntry,
      };

    } catch (error) {
      console.error(
        'Disease detection failed:',
        error
      );

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Unable to analyze the plant image.'
      );
    }
  },

  // Fetch permanent disease history from MongoDB.
  async getDiseaseHistory() {
    try {
      const response = await apiClient.get(
        '/disease/history'
      );

      const history = Array.isArray(response.data)
        ? response.data
        : response.data?.history || [];

      return history.map((item) => ({
        ...item,

        id: item._id || item.id,

        date: item.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : item.date,

        diseaseName:
          item.diseaseName ||
          item.name ||
          'Unknown',

        status:
          item.status ||
          (item.isHealthy ? 'Healthy' : 'Infected'),
      }));

    } catch (error) {
      console.error(
        'Unable to fetch MongoDB disease history:',
        error
      );

      // Fallback to locally cached history.
      return this.getLocalDiseaseHistory();
    }
  },

  // Read browser fallback history.
  getLocalDiseaseHistory() {
    try {
      return JSON.parse(
        localStorage.getItem(HISTORY_KEY) || '[]'
      );
    } catch {
      return [];
    }
  },
};
