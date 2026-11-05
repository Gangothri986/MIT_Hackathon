import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    farmName: {
      type: String,
      default: 'My Farm',
    },
    location: {
      type: String,
      default: 'Agricultural Region',
    },
    farmSize: {
      type: String,
      default: '5 Acres',
    },
    cropsMonitored: {
      type: [String],
      default: ['Tomato', 'Chilli', 'Paddy'],
    },
    role: {
      type: String,
      default: 'Farmer',
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
