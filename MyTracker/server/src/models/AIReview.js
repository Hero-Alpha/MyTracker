const mongoose = require('mongoose');

const aiReviewSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodStart: { type: Date, required: true },
  periodEnd:   { type: Date, required: true },

  payload: { type: mongoose.Schema.Types.Mixed },

  review: {
    summary:            { type: String },
    strengths:          [String],
    issues:             [String],
    recommendations:    [String],
    grocerySuggestions: [String],
  },
}, { timestamps: true });

aiReviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIReview', aiReviewSchema);
