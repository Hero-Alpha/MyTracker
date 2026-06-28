const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: Date, required: true },

  measurements: {
    chest: { type: Number, default: null },
    waist: { type: Number, default: null },
    neck:  { type: Number, default: null },
    arm:   { type: Number, default: null },
    thigh: { type: Number, default: null },
    hip:   { type: Number, default: null },
  },

  notes: { type: String, default: '' },
}, { timestamps: true });

bodyMeasurementSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
