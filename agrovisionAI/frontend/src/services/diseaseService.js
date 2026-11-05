// import { apiClient } from './api.js';
// import { IMAGES } from '../assets/images/index.js';

// export const KNOWN_DISEASES = [
//   {
//     id: 'early_blight',
//     crop: 'Tomato',
//     name: 'Early Blight (Alternaria solani)',
//     pathogenType: 'Fungal',
//     severity: 'Medium',
//     confidence: 96.4,
//     isHealthy: false,
//     symptoms: [
//       'Concentric ring spots on mature leaves',
//       'Yellow rings surrounding brown spot centers',
//       'Progressive defoliation advancing from base upward along canopy',
//     ],
//     affectedParts: 'Lower foliage, petioles, and stem junctions',
//     organicManagement: [
//       'Apply Trichoderma or Bacillus subtilis bio-fungicide spray.',
//       'Remove and safely dispose of infected lower leaves.',
//       'Apply organic neem oil spray as a preventive barrier.',
//     ],
//     chemicalTreatment: [
//       'Foliar spray of Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil @ 2 g/L.',
//       'Rotate with Azoxystrobin @ 1 ml/L if damp weather persists.',
//     ],
//     preventiveMeasures: [
//       'Use drip irrigation to keep leaves dry.',
//       'Maintain good spacing between plants for airflow.',
//       'Clean pruning shears between rows.',
//     ],
//   },
//   {
//     id: 'chilli_leaf_curl',
//     crop: 'Chilli',
//     name: 'Chilli Leaf Curl Virus (ChiLCV)',
//     pathogenType: 'Viral (Whitefly Vector)',
//     severity: 'High',
//     confidence: 93.8,
//     isHealthy: false,
//     symptoms: [
//       'Upward curling and thickening of younger leaves',
//       'Stunted internodes producing a bushy rosette appearance',
//       'Flower drop and smaller peppers',
//     ],
//     affectedParts: 'Apical shoots and young leaves',
//     organicManagement: [
//       'Install yellow sticky traps to catch whiteflies.',
//       'Spray 5% Neem Seed Kernel Extract weekly.',
//       'Remove severely stunted plants promptly.',
//     ],
//     chemicalTreatment: [
//       'Spray Imidacloprid 17.8% SL @ 0.3 ml/L or Diafenthiuron @ 1 g/L against vector.',
//       'Apply micronutrient spray to assist plant recovery.',
//     ],
//     preventiveMeasures: [
//       'Grow border crops as biological windbreak.',
//       'Use insect netting in seedling nurseries.',
//     ],
//   },
//   {
//     id: 'paddy_blast',
//     crop: 'Paddy',
//     name: 'Rice Blast (Magnaporthe oryzae)',
//     pathogenType: 'Fungal',
//     severity: 'High',
//     confidence: 91.5,
//     isHealthy: false,
//     symptoms: [
//       'Spindle-shaped spots with gray centers on leaf blades',
//       'Brown spots at leaf collars',
//       'Poor grain filling in affected panicles',
//     ],
//     affectedParts: 'Leaf blades, collar, and panicle neck',
//     organicManagement: [
//       'Seed treatment with Pseudomonas bio-agent before sowing.',
//       'Avoid excess nitrogen fertilizer; use split applications.',
//     ],
//     chemicalTreatment: [
//       'Spray Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane @ 1.5 ml/L.',
//     ],
//     preventiveMeasures: [
//       'Ensure proper water drainage; avoid stagnant standing pools.',
//     ],
//   },
//   {
//     id: 'healthy_specimen',
//     crop: 'All Crops',
//     name: 'No Pathogenic Infection Detected',
//     pathogenType: 'None',
//     severity: 'None',
//     confidence: 98.7,
//     isHealthy: true,
//     symptoms: ['Clean uniform foliage with intact leaf structure', 'Vibrant green chlorophyll color', 'No leaf spots, wilting, or fungal powder'],
//     affectedParts: 'None (Plant is healthy)',
//     organicManagement: ['Continue standard bio-fertilizer and organic maintenance.'],
//     chemicalTreatment: ['No chemical treatment needed.'],
//     preventiveMeasures: ['Continue routine farm checks every 7 days.', 'Maintain normal watering schedule.'],
//   },
// ];

// export const INITIAL_DISEASE_HISTORY = [
//   {
//     id: 'DIS-LOG-101',
//     date: '2026-11-04 09:30',
//     plantId: 'PLT-TOM-088',
//     crop: 'Tomato',
//     diseaseName: 'Early Blight (Alternaria solani)',
//     severity: 'Medium',
//     confidence: 96.4,
//     status: 'Infected',
//     treatmentStatus: 'Under Treatment',
//     imageUrl: IMAGES.leafDisease,
//   },
//   {
//     id: 'DIS-LOG-102',
//     date: '2026-11-02 14:15',
//     plantId: 'PLT-TOM-204',
//     crop: 'Tomato',
//     diseaseName: 'No Pathogenic Infection Detected',
//     severity: 'None',
//     confidence: 98.7,
//     status: 'Healthy',
//     treatmentStatus: 'Normal Monitoring',
//     imageUrl: IMAGES.tomatoFlowering,
//   },
//   {
//     id: 'DIS-LOG-103',
//     date: '2026-10-30 11:20',
//     plantId: 'PLT-PAD-032',
//     crop: 'Paddy',
//     diseaseName: 'Rice Blast (Magnaporthe oryzae)',
//     severity: 'Low',
//     confidence: 89.2,
//     status: 'Infected',
//     treatmentStatus: 'Resolved',
//     imageUrl: IMAGES.paddyField,
//   },
// ];

// export const diseaseService = {
//   async detectDisease({ imageFile, imageUrl, cropType = 'Tomato', simulateHealthy = false }) {
//     try {
//       const formData = new FormData();
//       if (imageFile) formData.append('image', imageFile);
//       formData.append('crop_type', cropType);

//       const response = await apiClient.post('/disease/detect', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       if (response.data) {
//         return {
//           ...response.data,
//           imageUrl: imageUrl || response.data.imageUrl,
//         };
//       }
//     } catch {
//       // Backend not running, use client fallback
//     }

//     await new Promise((resolve) => setTimeout(resolve, 600));

//     let result;
//     if (simulateHealthy) {
//       result = KNOWN_DISEASES.find(d => d.id === 'healthy_specimen');
//     } else if (cropType === 'Chilli') {
//       result = KNOWN_DISEASES.find(d => d.id === 'chilli_leaf_curl');
//     } else if (cropType === 'Paddy') {
//       result = KNOWN_DISEASES.find(d => d.id === 'paddy_blast');
//     } else {
//       result = KNOWN_DISEASES.find(d => d.id === 'early_blight');
//     }

//     const logEntry = {
//       id: `DIS-LOG-${Math.floor(100 + Math.random() * 900)}`,
//       date: new Date().toISOString().replace('T', ' ').slice(0, 16),
//       plantId: `PLT-${cropType.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
//       crop: cropType,
//       diseaseName: result.name,
//       severity: result.severity,
//       confidence: result.confidence,
//       status: result.isHealthy ? 'Healthy' : 'Infected',
//       treatmentStatus: result.isHealthy ? 'Normal Monitoring' : 'Action Recommended',
//       imageUrl: imageUrl || (result.isHealthy ? IMAGES.tomatoFlowering : IMAGES.leafDisease),
//     };

//     const history = JSON.parse(localStorage.getItem('agrovision_disease_history')) || INITIAL_DISEASE_HISTORY;
//     localStorage.setItem('agrovision_disease_history', JSON.stringify([logEntry, ...history]));

//     return {
//       ...result,
//       logEntry,
//       timestamp: new Date().toISOString(),
//     };
//   },

//   getDiseaseHistory() {
//     return JSON.parse(localStorage.getItem('agrovision_disease_history')) || INITIAL_DISEASE_HISTORY;
//   },
// };
import { apiClient } from './api.js';

const HISTORY_KEY = 'agrovision_disease_history';

export const diseaseService = {
  async detectDisease({ imageFile, imageUrl, cropType = 'Tomato' }) {
    try {
      const formData = new FormData();

      // Case 1: User uploaded an image
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Case 2: User selected one of the sample images
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

      // Send image to Node.js backend
      const response = await apiClient.post(
        '/disease/detect',
        formData
      );

      const data = response.data;

      // Prepare history entry
      const logEntry = {
        id: data.logId,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        plantId: data.plantId,
        crop: data.crop,
        diseaseName: data.name,
        severity: data.severity,
        confidence: data.confidence,
        status: data.isHealthy ? 'Healthy' : 'Infected',
        treatmentStatus: data.isHealthy
          ? 'Normal Monitoring'
          : 'Action Recommended',
        imageUrl: imageUrl || data.imageUrl,
      };

      // Save history in browser
      const existingHistory = this.getDiseaseHistory();

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([logEntry, ...existingHistory].slice(0, 20))
      );

      return {
        ...data,
        logEntry,
        imageUrl: imageUrl || data.imageUrl,
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

  getDiseaseHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  },
};