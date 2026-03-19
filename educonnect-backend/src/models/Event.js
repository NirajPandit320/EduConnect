const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    date: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
    },

    createdBy: {
      type: String, // admin uid
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    participants: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);