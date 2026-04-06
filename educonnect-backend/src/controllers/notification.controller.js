const Notification = require("../models/Notification");

// CREATE
exports.createNotification = async (data) => {
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

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// CREATE MANUALLY
exports.createNotificationHandler = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    const io = req.app.get("io");

    if (io && notification.userId) {
      io.to(notification.userId).emit("receive_notification", notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};