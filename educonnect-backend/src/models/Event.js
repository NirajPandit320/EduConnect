const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    location: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: String, // admin uid
      required: true,
      index: true,
    },

    image: {
      type: String,
      default: "",
    },

    participants: {
      type: [String],
      default: [],
    },

    capacity: {
      type: Number,
      default: null, // null means unlimited
      min: 1,
    },

    eventStatus: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Indexes for performance
eventSchema.index({ date: 1 });
eventSchema.index({ eventStatus: 1 });
eventSchema.index({ createdBy: 1, date: -1 });

module.exports = mongoose.model("Event", eventSchema);