const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate', required: true },
  templateName: { type: String, required: true },
  date:         { type: Date, required: true },
  status:       { type: String, enum: ['completed', 'partial', 'skipped'], required: true },
  duration:     { type: Number, default: null },
  notes:        { type: String, default: '' },
}, { timestamps: true });

workoutSessionSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
