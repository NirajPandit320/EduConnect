const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "" },
    ctc: { type: String, default: "" },
    description: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    deadline: { type: Date, default: null },

    eligibility: {
      branch: [String],
      minCGPA: Number,
      year: Number,
    },

    createdBy: {
      type: String, // admin UID
      default: "",
    },
  },
  { timestamps: true }
);

jobSchema.index({ createdAt: -1 });
jobSchema.index({ deadline: 1 });

module.exports = mongoose.model("Job", jobSchema);