import mongoose from 'mongoose';

const growthAnalysisSchema = new mongoose.Schema(
  {
    plantId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    cropType: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: 'North Field',
    },

    imageUrl: {
      type: String,
      required: true,
    },

    currentStage: {
      type: String,
      required: true,
    },

    stageIndex: {
      type: Number,
      required: true,
    },

    stageCode: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    healthScore: {
      type: Number,
      default: null,
    },

    previousStage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    nextStage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    daysToNextMilestone: {
      type: Number,
      default: null,
    },

    estimatedNextMilestoneDate: {
      type: Date,
      default: null,
    },

    accumulatedGDD: {
      type: Number,
      default: null,
    },

    targetGDDToNext: {
      type: Number,
      default: null,
    },

    visualCharacteristics: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    uncertainty: {
      type: String,
      default: null,
    },

    isReliable: {
      type: Boolean,
      default: false,
    },

    model: {
      type: String,
      default: null,
    },

    stageProgression: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const GrowthAnalysis = mongoose.model(
  'GrowthAnalysis',
  growthAnalysisSchema
);