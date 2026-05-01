const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    tags: [String],
    description: {
      type: String,
      required: true,
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    // For the Beginner Roadmap feature
    roadmapDay: {
      type: Number,
      default: null,
    },
    // Hints for the scaffolded hint system
    hints: {
      tier1: String,
      tier2: String,
      tier3: String,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
    totalSubmissions: {
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

module.exports = mongoose.model('Problem', problemSchema);