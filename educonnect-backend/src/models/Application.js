const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    userUid: {
      type: String, // using your UID system
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "rejected", "selected"],
      default: "applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, userUid: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);