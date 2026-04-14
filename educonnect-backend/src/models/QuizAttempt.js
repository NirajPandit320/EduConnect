const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    userUid: {
      type: String,
      required: true,
      index: true,
    },
    answers: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quizId: 1, userUid: 1 }, { unique: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
