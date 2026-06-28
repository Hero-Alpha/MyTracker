const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  foodId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit:     { type: String, required: true },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 },
  },
}, { _id: true });

const waterEntrySchema = new mongoose.Schema({
  amount:    { type: Number, required: true },
  loggedAt:  { type: Date, default: Date.now },
}, { _id: false });

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: Date, required: true },

  meals: {
    breakfast: [mealItemSchema],
    lunch:     [mealItemSchema],
    dinner:    [mealItemSchema],
    snacks:    [mealItemSchema],
  },

  water: {
    entries: [waterEntrySchema],
    total:   { type: Number, default: 0 },
  },

  workout: {
    templateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate', default: null },
    templateName: { type: String, default: null },
    status:       { type: String, enum: ['not_logged', 'completed', 'partial', 'skipped'], default: 'not_logged' },
    notes:        { type: String, default: '' },
  },

  weight: { type: Number, default: null },
  notes:  { type: String, default: '' },

  totals: {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 },
  },

  aiReviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIReview', default: null },
}, { timestamps: true });

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
