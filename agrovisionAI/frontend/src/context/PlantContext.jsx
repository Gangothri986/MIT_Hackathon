import React, { createContext, useContext, useState, useEffect } from 'react';
import { plantService, INITIAL_PLANTS } from '../services/plantService';
import { IMAGES } from '../assets/images';

const PlantContext = createContext(null);

const INITIAL_RECOMMENDATIONS = [
  {
    id: 'REC-01',
    priority: 'High',
    plantId: 'PLT-TOM-088',
    plantName: 'Tomato Arka Vikas - Row 12',
    crop: 'Tomato',
    stage: 'Bud Formation',
    reason: 'Early Blight (Alternaria solani) detected with 96.4% confidence on lower leaves.',
    suggestedAction: 'Apply foliar spray of Mancozeb (2.5 g/L) or Copper Oxychloride. Prune lower 15 cm leaves immediately to halt spore splash.',
    category: 'Disease Treatment',
    completed: false,
    timestamp: '2 hours ago',
  },
  {
    id: 'REC-02',
    priority: 'High',
    plantId: 'PLT-ALL-ENV',
    plantName: 'All Monitored Plots',
    crop: 'Multi-Crop',
    stage: 'All Stages',
    reason: 'Forecast predicts 28mm heavy rainfall and >82% humidity over the coming weekend.',
    suggestedAction: 'Clear furrow drainage channels across Plot A & C. Suspend automatic drip irrigation valves starting Friday morning.',
    category: 'Irrigation & Drainage',
    completed: false,
    timestamp: '4 hours ago',
  },
  {
    id: 'REC-03',
    priority: 'Medium',
    plantId: 'PLT-TOM-204',
    plantName: 'Tomato Arka Rakshak - Row 4',
    crop: 'Tomato',
    stage: 'Flowering',
    reason: 'Anthesis in peak bloom; high heat index projected during midday (34°C).',
    suggestedAction: 'Activate polyhouse shade net (50%) and run micro-misting for 15 mins around 13:00 to prevent blossom drop.',
    category: 'Microclimate Protection',
    completed: false,
    timestamp: '6 hours ago',
  },
  {
    id: 'REC-04',
    priority: 'Medium',
    plantId: 'PLT-CHL-108',
    plantName: 'Byadgi Chilli - Plot C Bed 1',
    crop: 'Chilli',
    stage: 'Vegetative Growth',
    reason: 'Rapid branch multiplication; approaching Bud Formation milestone in ~10 days.',
    suggestedAction: 'Apply balanced 19:19:19 water-soluble fertigation (3 g/plant) to build carbohydrate reserves for flower buds.',
    category: 'Fertigation',
    completed: false,
    timestamp: '1 day ago',
  },
  {
    id: 'REC-05',
    priority: 'Low',
    plantId: 'PLT-PAD-032',
    plantName: 'Jyothi Paddy - Sector 7',
    crop: 'Paddy',
    stage: 'Fruit Formation',
    reason: 'Milky grain fill proceeding normally; 4 cm water depth verified.',
    suggestedAction: 'Schedule periodic panicle inspection in 4 days. Maintain continuous shallow submergence until dough stage.',
    category: 'Crop Inspection',
    completed: false,
    timestamp: '1 day ago',
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    type: 'critical',
    title: 'High Fungal Disease Risk Alert',
    message: 'High humidity (>82%) combined with rainfall will create prime conditions for Early Blight proliferation over the weekend.',
    timestamp: 'Just now',
    read: false,
    link: '/weather',
  },
  {
    id: 'NOTIF-02',
    type: 'warning',
    title: 'Disease Detected on Tomato Row 12',
    message: 'AI Diagnostic classified Early Blight on PLT-TOM-088. Foliar fungicide treatment recommended.',
    timestamp: '2 hours ago',
    read: false,
    link: '/disease',
  },
  {
    id: 'NOTIF-03',
    type: 'success',
    title: 'Milestone Reached: Flowering Stage Confirmed',
    message: 'Tomato Arka Rakshak (PLT-TOM-204) transitioned into full Flowering stage with 94.6% model confidence.',
    timestamp: 'Yesterday',
    read: false,
    link: '/predictions',
  },
  {
    id: 'NOTIF-04',
    type: 'info',
    title: 'Heat Stress Warning for Friday',
    message: 'Peak temperatures will reach 34°C. Polyhouse misting recommended for flowering crops.',
    timestamp: '1 day ago',
    read: true,
    link: '/risk-assessment',
  },
];

export function PlantProvider({ children }) {
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('agrovision_plants');
    return saved ? JSON.parse(saved) : INITIAL_PLANTS;
  });

  const [recommendations, setRecommendations] = useState(() => {
    const saved = localStorage.getItem('agrovision_recommendations');
    return saved ? JSON.parse(saved) : INITIAL_RECOMMENDATIONS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('agrovision_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [selectedPlant, setSelectedPlant] = useState(() => plants[0] || null);

  useEffect(() => {
    localStorage.setItem('agrovision_plants', JSON.stringify(plants));
  }, [plants]);

  useEffect(() => {
    localStorage.setItem('agrovision_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem('agrovision_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addPlant = async (newPlantData) => {
  try {
    const plant = await plantService.createPlant(newPlantData);

    // Ensure the plant was actually saved in MongoDB
    if (!plant?._id) {
      throw new Error('Plant was not saved to MongoDB. Missing MongoDB ID.');
    }

    const savedPlant = {
      ...plant,
      id: plant.id || plant.customId || plant._id,
    };

    setPlants((prev) => [savedPlant, ...prev]);

    return savedPlant;
  } catch (error) {
    console.error('Error creating plant:', error);
    throw error;
  }
};
  const completeRecommendation = (id) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, completed: !rec.completed } : rec))
    );
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updatePlantAnalysis = (plantId, analysisResult) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id === plantId) {
          return {
            ...p,
            currentStage: analysisResult.currentStage,
            stageIndex: analysisResult.stageIndex,
            confidence: analysisResult.confidence,
            healthScore: analysisResult.healthScore || p.healthScore,
            lastAnalysedDate: new Date().toISOString().split('T')[0],
            imageUrl: analysisResult.imageUrl || p.imageUrl,
            history: [
              ...p.history,
              {
                date: new Date().toISOString().split('T')[0],
                stage: analysisResult.currentStage,
                healthScore: analysisResult.healthScore || p.healthScore,
                imageUrl: analysisResult.imageUrl || p.imageUrl,
                note: `Deep learning stage prediction: ${analysisResult.currentStage} (${analysisResult.confidence}% confidence).`,
              },
            ],
          };
        }
        return p;
      })
    );
  };
const updateWheatPrediction = (plantId, prediction) => {
  setPlants((prev) =>
    prev.map((p) => {
      if (p.id === plantId || p._id === plantId || p.customId === plantId) {
        return {
          ...p,
          currentStage: prediction.stage,
          stageIndex: prediction.stageIndex,
          confidence: prediction.confidence,
          lastAnalysedDate: new Date().toISOString().split('T')[0],
          history: [
            ...(p.history || []),
            {
              date: new Date().toISOString().split('T')[0],
              stage: prediction.stage,
              healthScore: p.healthScore || 90,
              imageUrl: p.imageUrl,
              note: `Nyckel Wheat growth-stage prediction: ${prediction.stage} (${prediction.confidence}% confidence).`,
            },
          ],
        };
      }
      return p;
    })
  );
};
  return (
    <PlantContext.Provider
      value={{
        plants,
        selectedPlant,
        setSelectedPlant,
        addPlant,
        updatePlantAnalysis,
        updateWheatPrediction,
        recommendations,
        completeRecommendation,
        notifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        dismissNotification,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export const usePlant = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
};
