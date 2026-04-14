const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        question: { type: String, required: true, trim: true },
        options: { type: [String], required: true, default: [] },
        answer: { type: String, required: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

quizSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Quiz", quizSchema);