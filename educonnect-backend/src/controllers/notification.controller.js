const Notification = require("../models/Notification");
const User = require("../models/User");

// CREATE
exports.createNotification = async (data) => {
  if (!data?.userId || !data?.text) {
    throw new Error("userId and text are required");
  }

  return await Notification.create(data);
};

exports.createAndEmitNotification = async (io, data) => {
  const notification = await Notification.create(data);

  if (io && data?.userId) {
    io.to(data.userId).emit("receive_notification", notification);
  }

  return notification;
};

// GET USER NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
        data: null,
      });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification id is required",
        data: null,
      });
    }

    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      data: null,
      error: error.message,
    });
  }
};

// CREATE MANUALLY
exports.createNotificationHandler = async (req, res) => {
  try {
    const { userId, senderId, type, text, link } = req.body || {};
    const adminHeader = req.headers?.email || req.headers?.["x-admin-email"];
    const io = req.app.get("io");

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "text is required",
        data: null,
      });
    }

    // Admin broadcast support for existing admin UI that only sends text.
    if (!userId && adminHeader) {
      const users = await User.find().select("uid");
      const payload = users.map((user) => ({
        userId: user.uid,
        senderId: senderId || adminHeader,
        type: type || "admin",
        text,
        link: link || "",
      }));

      const notifications = await Notification.insertMany(payload);

      if (io) {
        notifications.forEach((notification) => {
          io.to(notification.userId).emit("receive_notification", notification);
        });
      }

      return res.status(201).json({
        success: true,
        message: "Notification broadcast created",
        data: notifications,
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
        data: null,
      });
    }

    const notification = await Notification.create({
      userId,
      senderId: senderId || userId,
      type: type || "general",
      text,
      link: link || "",
    });

    if (io && notification.userId) {
      io.to(notification.userId).emit("receive_notification", notification);
    }

    res.status(201).json({
      success: true,
      message: "Notification created",
      data: notification,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      data: null,
      error: error.message,
    });
  }
};