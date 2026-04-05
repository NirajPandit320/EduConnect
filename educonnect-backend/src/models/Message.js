const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // Firebase UID
      required: true,
    },
    receiver: {
      type: String, // Firebase UID
      required: true,
    },
    text: {
      type: String,
    },
    file: {
      type: String, // file URL (future use)
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);