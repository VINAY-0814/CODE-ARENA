const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    badgeIcon: {
      type: String,
      default: 'Award',
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    category: {
      type: String,
      default: 'General',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
