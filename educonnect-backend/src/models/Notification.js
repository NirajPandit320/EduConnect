const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: String, // receiver
    senderId: String,
    type: String, // message, like, comment, call, event
    text: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    link: String, // optional redirect (post/event/chat)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);