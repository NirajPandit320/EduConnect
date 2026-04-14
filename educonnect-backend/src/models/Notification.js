const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // receiver
    senderId: { type: String, default: "" },
    type: { type: String, default: "general" }, // message, like, comment, call, event
    text: { type: String, required: true },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: { type: String, default: "" }, // optional redirect (post/event/chat)
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);