const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    userUid: {
      type: String, // using Firebase UID system
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "rejected", "selected"],
      default: "applied",
    },

    feedback: {
      type: String,
      default: null,
    },

    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, userUid: 1 }, { unique: true });

// Index for quick lookup of user applications
applicationSchema.index({ userUid: 1, createdAt: -1 });

// Index for job applications
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);