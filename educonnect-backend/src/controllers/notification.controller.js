const Notification = require("../models/Notification");
const User = require("../models/User");

const normalizeNotificationType = (type) => {
  const allowedTypes = new Set([
    "message",
    "like",
    "comment",
    "call",
    "event",
    "post",
    "application",
    "quiz",
    "general",
    "info",
    "warning",
    "success",
    "error",
  ]);

  const normalized = String(type || "general").trim().toLowerCase();
  return allowedTypes.has(normalized) ? normalized : "general";
};

const buildNotificationText = ({ text, message, title }) => {
  if (String(text || "").trim()) return String(text).trim();
  if (String(message || "").trim() && String(title || "").trim()) {
    return `${String(title).trim()}: ${String(message).trim()}`;
  }
  return String(message || title || "Notification").trim();
};

const getActiveUserIds = async () => {
  const users = await User.find({ status: "active" }).select("uid");
  return users.map((user) => user.uid).filter(Boolean);
};

// CREATE
exports.createNotification = async (data) => {
  return await Notification.create(data);
};

exports.createAndEmitNotification = async (io, data) => {
  const notification = await Notification.create({
    ...data,
    type: normalizeNotificationType(data?.type),
    text: buildNotificationText(data),
    senderId: data?.senderId || data?.userId || "system",
  });

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
    const io = req.app.get("io");
    const {
      broadcast,
      userId,
      senderId,
      type,
      text,
      message,
      title,
      link,
      metadata,
    } = req.body || {};

    const normalizedType = normalizeNotificationType(type);
    const normalizedText = buildNotificationText({ text, message, title });

    if (broadcast) {
      const targetUserIds = await getActiveUserIds();

      if (targetUserIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No active users found for broadcast",
          data: { notifications: [] },
        });
      }

      const createdNotifications = await Notification.insertMany(
        targetUserIds.map((targetUserId) => ({
          userId: targetUserId,
          senderId: senderId || "admin",
          type: normalizedType,
          text: normalizedText,
          link: link || null,
          metadata: {
            ...(metadata || {}),
            broadcast: true,
            title: title || null,
          },
        }))
      );

      if (io) {
        createdNotifications.forEach((notification) => {
          io.to(notification.userId).emit("receive_notification", notification);
        });
      }

      return res.status(201).json({
        success: true,
        message: "Notification broadcast sent successfully",
        data: {
          notifications: createdNotifications,
          count: createdNotifications.length,
        },
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required unless broadcast is true",
      });
    }

    const notification = await Notification.create({
      userId,
      senderId: senderId || userId || "system",
      type: normalizedType,
      text: normalizedText,
      link: link || null,
      metadata: metadata || {},
    });

    if (io && notification.userId) {
      io.to(notification.userId).emit("receive_notification", notification);
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};