
import mongoose from 'mongoose';

const plantHistorySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },

  stage: {
    type: String,
    required: true,
  },

  healthScore: {
    type: Number,
    default: 90,
  },

  imageUrl: {
    type: String,
  },

  note: {
    type: String,
  },
});

const plantSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    cropType: {
      type: String,
      required: true,
      enum: [
        'Tomato',
        'Chilli',
        'Paddy',
        'Wheat',
        'Maize',
        'Cotton',
        'Ragi',
        'Potato',
        'Groundnut',
        'Soybean',
        'Sugarcane',
        'Other',
      ],
      default: 'Tomato',
    },

    variety: {
      type: String,
      default: 'Commercial Variety',
    },

    location: {
      type: String,
      default: 'North Plot',
    },

    plantedDate: {
      type: String,
      required: true,
    },

    daysAfterPlanting: {
      type: Number,
      default: 1,
    },

    currentStage: {
      type: String,

      enum: [
        // Common growth stages
        'Seedling',
        'Vegetative Growth',
        'Bud Formation',
        'Flowering',
        'Fruit Formation',
        'Fruit Development',
        'Maturity',
        'Maturity / Harvesting',

        // Wheat and Paddy
        'Emergence',
        'Tillering',
        'Stem Elongation',
        'Booting',
        'Heading',
        'Grain Filling',

        // Maize
        'Tasseling',
        'Silking',

        // Cotton
        'Squaring',
        'Boll Development',
        'Boll Opening',

        // Potato
        'Sprouting',
        'Tuber Development',
        'Maturation',

        // Groundnut
        'Pegging',
        'Pod Development',

        // Soybean
        'Pod Formation',
        'Seed Filling',

        // Sugarcane
        'Germination',
        'Grand Growth',

        // Tomato
        'Ripening',

        // Nyckel Wheat classifier
        'Fruiting',
        'Mature',
      ],

      default: 'Vegetative Growth',
    },

    stageIndex: {
      type: Number,
      default: 0,
    },

    confidence: {
      type: Number,
      default: 92.5,
      min: 0,
      max: 100,
    },

    healthStatus: {
      type: String,
      enum: [
        'Healthy',
        'Attention Needed',
        'Diseased',
      ],
      default: 'Healthy',
    },

    healthScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Low',
    },

    lastAnalysedDate: {
      type: String,
    },

    imageUrl: {
      type: String,
    },

    soilMoisture: {
      type: String,
      default: '30%',
    },

    gddAccumulated: {
      type: Number,
      default: 400,
    },

    gddTargetFlowering: {
      type: Number,
      default: 650,
    },

    gddTargetMaturity: {
      type: Number,
      default: 1400,
    },

    estimatedNextMilestone: {
      stage: {
        type: String,
        default: 'Bud Formation',
      },

      estimatedDate: {
        type: String,
      },

      daysRemaining: {
        type: Number,
        default: 10,
      },

      confidence: {
        type: Number,
        default: 89,
      },
    },

    observations: {
      type: [String],
      default: [],
    },

    history: {
      type: [plantHistorySchema],
      default: [],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  {
    timestamps: true,
  }
);

export const Plant = mongoose.model('Plant', plantSchema);
