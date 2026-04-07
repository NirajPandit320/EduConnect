const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    ctc: String,
    description: String,
    requirements: [String],
    deadline: Date,

    eligibility: {
      branch: [String],
      minCGPA: Number,
      year: Number,
    },

    createdBy: {
      type: String, // admin UID
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);