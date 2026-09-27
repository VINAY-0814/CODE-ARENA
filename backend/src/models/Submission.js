const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
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
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    problemTitle: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'],
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
      required: true,
      index: true,
    },
    testCasesPassed: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      required: true,
      default: 0,
    },
    executionTime: {
      type: Number, // in ms
      default: 0,
    },
    memoryUsed: {
      type: Number, // in KB
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    details: [
      {
        testCaseNumber: Number,
        passed: Boolean,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        error: String,
        executionTimeMs: Number,
        isHidden: Boolean,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ userId: 1, problemId: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
