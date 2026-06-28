const mongoose = require('mongoose');

const dailyTargetsSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  water:    { type: Number, default: 2500 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  name:   { type: String, trim: true },
  age:    { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },

  height: {
    value: { type: Number },
    unit:  { type: String, enum: ['cm', 'ft'], default: 'cm' },
  },

  currentWeight: { type: Number },
  targetWeight:  { type: Number },

  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  },

  goal: {
    type: String,
    enum: ['lose_weight', 'maintain', 'gain_muscle'],
  },

  dailyTargets: { type: dailyTargetsSchema, default: () => ({}) },

  profileComplete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
