const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    ctc: {
      type: Number, // In LPA or appropriate currency
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    deadline: {
      type: Date,
    },

    eligibility: {
      branch: [String],
      minCGPA: {
        type: Number,
        min: 0,
        max: 10,
      },
      year: Number,
    },

    createdBy: {
      type: String, // admin UID
      index: true,
    },

    jobStatus: {
      type: String,
      enum: ["active", "closed", "archived"],
      default: "active",
    },

    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for performance
jobSchema.index({ createdBy: 1, createdAt: -1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ jobStatus: 1 });

module.exports = mongoose.model("Job", jobSchema);