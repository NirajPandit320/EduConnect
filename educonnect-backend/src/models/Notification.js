const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // receiver - Firebase UID
      required: true,
      index: true,
    },

    senderId: {
      type: String, // who sent it
      required: true,
    },

    type: {
      type: String,
      enum: ["message", "like", "comment", "call", "event", "post", "application", "general"],
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    link: {
      type: String,
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index - automatically delete after expiresAt
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for user notifications sorted by newest first
notificationSchema.index({ userId: 1, createdAt: -1 });

// Index for unread notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);