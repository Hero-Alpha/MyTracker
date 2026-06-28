const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  date:   { type: Date, required: true },
  notes:  { type: String, default: '' },
}, { timestamps: true });

weightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
