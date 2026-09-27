const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Arrays',
        'Strings',
        'Linked Lists',
        'Stacks',
        'Queues',
        'Trees',
        'Graphs',
        'Dynamic Programming',
        'Algorithms',
        'Mathematics',
      ],
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      default: 50,
    },
    supportedLanguages: {
      type: [String],
      default: ['javascript', 'python', 'java', 'cpp'],
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
        explanation: { type: String },
      },
    ],
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    hints: {
      type: [String],
      default: [],
    },
    acceptanceRate: {
      type: Number,
      default: 100,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

problemSchema.index({ difficulty: 1, category: 1 });

module.exports = mongoose.model('Problem', problemSchema);
