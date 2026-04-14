const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // Firebase UID
      required: true,
      index: true,
    },

    receiver: {
      type: String, // Firebase UID
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
    },

    file: {
      type: String, // file URL
    },

    fileName: {
      type: String,
    },

    fileType: {
      type: String,
    },

    messageType: {
      type: String,
      enum: ["text", "file", "call"],
      default: "text",
    },

    call: {
      type: {
        type: String,
        enum: ["audio", "video"],
      },
      status: {
        type: String,
        enum: ["started", "missed", "ended", "rejected"],
      },
      durationSec: {
        type: Number,
        default: 0,
      },
      startedAt: {
        type: Date,
      },
      endedAt: {
        type: Date,
      },
    },

    seen: {
      type: Boolean,
      default: false,
      index: true,
    },

    seenAt: {
      type: Date,
      default: null,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 }); // Conversation lookup
messageSchema.index({ receiver: 1, seen: 1 }); // Unread messages
messageSchema.index({ createdAt: 1 }); // For cleanup

module.exports = mongoose.model("Message", messageSchema);