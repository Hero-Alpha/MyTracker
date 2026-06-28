const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  sets:  { type: Number, required: true },
  reps:  { type: String, required: true },
  notes: { type: String, default: '' },
}, { _id: true });

const workoutTemplateSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true, trim: true },
  exercises: [exerciseSchema],
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

workoutTemplateSchema.index({ userId: 1 });

module.exports = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
