const mongoose = require('mongoose');

const commonUnitSchema = new mongoose.Schema({
  unit:  { type: String, required: true },
  grams: { type: Number, required: true },
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  sugar:    { type: Number, default: 0 },
  fiber:    { type: Number, default: 0 },
}, { _id: false });

const foodSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  source:      { type: String, enum: ['system', 'user'], required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  servingSize: { type: Number, required: true },
  servingUnit: { type: String, required: true },

  nutrition:   { type: nutritionSchema, required: true },

  commonUnits: [commonUnitSchema],

  category: {
    type: String,
    enum: ['grain', 'protein', 'dairy', 'vegetable', 'fruit', 'fat', 'beverage', 'snack', 'supplement', 'other'],
    default: 'other',
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

foodSchema.index({ name: 'text' });
foodSchema.index({ source: 1, userId: 1 });

module.exports = mongoose.model('Food', foodSchema);
