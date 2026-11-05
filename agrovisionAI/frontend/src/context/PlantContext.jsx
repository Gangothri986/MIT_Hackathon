
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { plantService } from '../services/plantService';

const PlantContext = createContext(null);

// ======================================================
// INITIAL RECOMMENDATIONS
// ======================================================

const INITIAL_RECOMMENDATIONS = [
  {
    id: 'REC-01',
    priority: 'High',
    plantId: 'PLT-TOM-088',
    plantName: 'Tomato Arka Vikas - Row 12',
    crop: 'Tomato',
    stage: 'Bud Formation',
    reason: 'Early Blight detected on lower leaves.',
    suggestedAction: 'Inspect affected leaves and follow locally approved disease-management guidance.',
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
    reason: 'Forecast indicates possible heavy rainfall and high humidity.',
    suggestedAction: 'Inspect drainage channels and adjust irrigation based on field conditions.',
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
    reason: 'Flowering crops may be affected by high temperatures.',
    suggestedAction: 'Monitor temperature and maintain suitable growing conditions.',
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
    reason: 'Plant approaching its next growth milestone.',
    suggestedAction: 'Monitor branching, soil moisture and nutrient requirements.',
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
    stage: 'Grain Filling',
    reason: 'Grain filling stage requires periodic inspection.',
    suggestedAction: 'Inspect panicles and maintain suitable field water conditions.',
    category: 'Crop Inspection',
    completed: false,
    timestamp: '1 day ago',
  },
];

// ======================================================
// INITIAL NOTIFICATIONS
// ======================================================

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    type: 'critical',
    title: 'High Fungal Disease Risk Alert',
    message: 'Monitor humidity and rainfall conditions in your fields.',
    timestamp: 'Just now',
    read: false,
    link: '/weather',
  },
  {
    id: 'NOTIF-02',
    type: 'warning',
    title: 'Disease Detected on Tomato Row 12',
    message: 'Review the tomato disease analysis and recommended actions.',
    timestamp: '2 hours ago',
    read: false,
    link: '/disease',
  },
  {
    id: 'NOTIF-03',
    type: 'success',
    title: 'Milestone Reached: Flowering Stage Confirmed',
    message: 'A tomato plant has reached the flowering stage.',
    timestamp: 'Yesterday',
    read: false,
    link: '/predictions',
  },
  {
    id: 'NOTIF-04',
    type: 'info',
    title: 'Heat Stress Warning',
    message: 'Monitor temperature conditions for flowering crops.',
    timestamp: '1 day ago',
    read: true,
    link: '/risk-assessment',
  },
];

// ======================================================
// HELPERS
// ======================================================

const normalizePlant = (plant) => ({
  ...plant,
  id: plant.customId || plant._id,
});

const getPlantIdentifier = (plant) =>
  plant?.customId || plant?._id || plant?.id;

// ======================================================
// PLANT PROVIDER
// ======================================================

export function PlantProvider({ children }) {
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [plantsError, setPlantsError] = useState(null);

  const [selectedPlant, setSelectedPlant] = useState(null);

  const [recommendations, setRecommendations] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'agrovision_recommendations'
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_RECOMMENDATIONS;
    } catch {
      return INITIAL_RECOMMENDATIONS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'agrovision_notifications'
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // ====================================================
  // FETCH PLANTS FROM MONGODB
  // ====================================================

  const fetchPlants = async () => {
    try {
      setPlantsLoading(true);
      setPlantsError(null);

      const data = await plantService.getPlants();

      const normalizedPlants = Array.isArray(data)
        ? data.map(normalizePlant)
        : [];

      setPlants(normalizedPlants);

      setSelectedPlant((previous) => {
        if (!previous) {
          return normalizedPlants[0] || null;
        }

        const previousId = getPlantIdentifier(previous);

        return (
          normalizedPlants.find(
            (plant) =>
              getPlantIdentifier(plant) === previousId ||
              plant._id === previous._id
          ) ||
          normalizedPlants[0] ||
          null
        );
      });

    } catch (error) {
      console.error(
        'Failed to fetch plants from MongoDB:',
        error
      );

      setPlantsError(
        error.response?.data?.message ||
        error.message ||
        'Unable to load plants from MongoDB.'
      );

    } finally {
      setPlantsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // ====================================================
  // SAVE RECOMMENDATIONS LOCALLY
  // ====================================================

  useEffect(() => {
    localStorage.setItem(
      'agrovision_recommendations',
      JSON.stringify(recommendations)
    );
  }, [recommendations]);

  // ====================================================
  // SAVE NOTIFICATIONS LOCALLY
  // ====================================================

  useEffect(() => {
    localStorage.setItem(
      'agrovision_notifications',
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // ====================================================
  // ADD NEW PLANT TO MONGODB
  // ====================================================

  const addPlant = async (plantData) => {
    try {
      const savedPlant = await plantService.createPlant(
        plantData
      );

      if (!savedPlant?._id) {
        throw new Error(
          'MongoDB did not confirm plant creation.'
        );
      }

      const newPlant = normalizePlant(savedPlant);

      setPlants((previous) => [
        newPlant,
        ...previous.filter(
          (plant) => plant._id !== newPlant._id
        ),
      ]);

      setSelectedPlant(newPlant);

      return newPlant;

    } catch (error) {
      console.error('Failed to save plant:', error);
      throw error;
    }
  };

  // ====================================================
  // UPDATE PLANT ANALYSIS IN MONGODB
  // ====================================================

  const updatePlantAnalysis = async (
    plantId,
    analysisResult
  ) => {
    try {
      const existingPlant = plants.find(
        (plant) =>
          plant.id === plantId ||
          plant._id === plantId ||
          plant.customId === plantId
      );

      if (!existingPlant) {
        throw new Error('Plant not found.');
      }

      const today = new Date()
        .toISOString()
        .split('T')[0];

      const updatedImageUrl =
        analysisResult.imageUrl ||
        existingPlant.imageUrl;

      const updatedHistory = [
        ...(existingPlant.history || []),
        {
          date: today,
          stage: analysisResult.currentStage,
          healthScore:
            analysisResult.healthScore ??
            existingPlant.healthScore ??
            90,
          imageUrl: updatedImageUrl,
          note:
            `Gemini prediction: ${analysisResult.currentStage} ` +
            `(${analysisResult.confidence}% confidence).`,
        },
      ];

      const updateData = {
        currentStage: analysisResult.currentStage,
        stageIndex: analysisResult.stageIndex,
        confidence: analysisResult.confidence,
        lastAnalysedDate: today,
        imageUrl: updatedImageUrl,
        history: updatedHistory,
      };

      const savedPlant = await plantService.updatePlant(
        getPlantIdentifier(existingPlant),
        updateData
      );

      if (!savedPlant?._id) {
        throw new Error('Plant update was not confirmed.');
      }

      const normalizedPlant = normalizePlant(savedPlant);

      setPlants((previous) =>
        previous.map((plant) =>
          plant._id === normalizedPlant._id
            ? normalizedPlant
            : plant
        )
      );

      setSelectedPlant((previous) =>
        previous?._id === normalizedPlant._id
          ? normalizedPlant
          : previous
      );

      return normalizedPlant;

    } catch (error) {
      console.error(
        'Error saving plant analysis:',
        error
      );

      throw error;
    }
  };

  // ====================================================
  // RECOMMENDATIONS
  // ====================================================

  const completeRecommendation = (id) => {
    setRecommendations((previous) =>
      previous.map((recommendation) =>
        recommendation.id === id
          ? {
              ...recommendation,
              completed: !recommendation.completed,
            }
          : recommendation
      )
    );
  };

  // ====================================================
  // NOTIFICATIONS
  // ====================================================

  const markNotificationAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const dismissNotification = (id) => {
    setNotifications((previous) =>
      previous.filter(
        (notification) => notification.id !== id
      )
    );
  };

  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  return (
    <PlantContext.Provider
      value={{
        plants,
        plantsLoading,
        plantsError,
        fetchPlants,

        selectedPlant,
        setSelectedPlant,

        addPlant,
        updatePlantAnalysis,

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

// ======================================================
// CUSTOM HOOK
// ======================================================

export const usePlant = () => {
  const context = useContext(PlantContext);

  if (!context) {
    throw new Error(
      'usePlant must be used within a PlantProvider'
    );
  }

  return context;
};
