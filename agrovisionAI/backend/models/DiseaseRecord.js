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
    },
    crop: {
      type: String,
      required: true,
    },
    diseaseName: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High'],
      default: 'Medium',
    },
    confidence: {
      type: Number,
      required: true,
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
    date: {
      type: String,
      required: true,
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

export const DiseaseRecord = mongoose.model('DiseaseRecord', diseaseRecordSchema);
