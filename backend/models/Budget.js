const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['food', 'travel', 'bills', 'shopping', 'health', 'others'],
      lowercase: true,
    },
    limit: {
      type: Number,
      required: [true, 'Please provide a budget limit'],
      min: [0, 'Limit must be a positive number'],
    },
    month: {
      type: Number,
      required: [true, 'Please provide month'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please provide year'],
    },
  },
  { timestamps: true }
);

// Compound index to ensure one budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

