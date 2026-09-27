const mongoose = require('mongoose');

const battleParticipantSchema = new mongoose.Schema(
  {
    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ready', 'coding', 'submitted', 'surrendered'],
      default: 'ready',
    },
    testsPassed: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
    },
    code: {
      type: String,
    },
    language: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BattleParticipant', battleParticipantSchema);
