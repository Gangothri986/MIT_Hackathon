
import mongoose from 'mongoose';

const diseaseRecordSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
    },

    plantId: {
      type: String,
      default: 'N/A',
    },

    crop: {
      type: String,
      required: true,
      enum: ['Tomato', 'Chilli', 'Paddy'],
    },

    diseaseName: {
      type: String,
      required: true,
    },

    alternativeDiagnosis: {
      type: String,
      default: '',
    },

    isHealthy: {
      type: Boolean,
      default: false,
    },

    severity: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High'],
      default: 'Medium',
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    pathogenType: {
      type: String,
      default: '',
    },

    affectedParts: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['Healthy', 'Infected'],
      default: 'Infected',
    },

    treatmentStatus: {
      type: String,
      default: 'Action Recommended',
    },

    imageUrl: {
      type: String,
      default: '',
    },

    symptoms: {
      type: [String],
      default: [],
    },

    organicManagement: {
      type: [String],
      default: [],
    },

    chemicalTreatment: {
      type: [String],
      default: [],
    },

    preventiveMeasures: {
      type: [String],
      default: [],
    },

    date: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const DiseaseRecord = mongoose.model(
  'DiseaseRecord',
  diseaseRecordSchema
);
