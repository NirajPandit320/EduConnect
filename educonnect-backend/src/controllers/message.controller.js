// Message Controller - Production Ready with Authorization
const Message = require("../models/Message");
const User = require("../models/User");
const { createAndEmitNotification } = require("./notification.controller");
const { sendSuccess, sendError, sendValidationError } = require("../utils/response");
const { sanitizeText, validateRequiredFields, validateStringLength } = require("../utils/validators");
const log = require("../utils/logger");

/**
 * SEND MESSAGE
 */
exports.sendMessage = async (req, res) => {
  try {
    const {
      sender,
      receiver,
      text,
      file,
      fileName,
      fileType,
      messageType,
      call,
    } = req.body;

    // Validation
    const errors = validateRequiredFields({ sender, receiver }, ["sender", "receiver"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    // Determine message type
    const resolvedMessageType = messageType || (call ? "call" : file ? "file" : "text");

    // Validate content based on type
    if (!text && !file && resolvedMessageType !== "call") {
      return sendValidationError(res, "Message text, file, or call payload required");
    }

    // Validate text length if present
    if (text && !validateStringLength(text, 1, 5000)) {
      return sendValidationError(res, "Message must be between 1-5000 characters");
    }

    // Verify sender and receiver exist
    const [senderUser, receiverUser] = await Promise.all([
      User.findOne({ uid: sender }),
      User.findOne({ uid: receiver }),
    ]);

    if (!senderUser) {
      return sendError(res, "Sender user not found", 404);
    }
    if (!receiverUser) {
      return sendError(res, "Receiver user not found", 404);
    }

    // Prevent self-messaging
    if (sender === receiver) {
      return sendError(res, "Cannot send message to yourself", 400);
    }

    // Create message
    const message = await Message.create({
      sender,
      receiver,
      text: text ? sanitizeText(text) : null,
      file,
      fileName,
      fileType,
      messageType: resolvedMessageType,
      call,
      seen: false,
      deleted: false,
    });

    // Send notification (non-blocking)
    setImmediate(async () => {
      try {
        const io = req.app.get("io");
        if (!io) return;

        await createAndEmitNotification(io, {
          userId: receiver,
          senderId: sender,
          type: "message",
          text: `${senderUser.name || senderUser.email} sent you a message`,
          link: "/chat",
        });
      } catch (notificationError) {
        log.warn("Message notification failed", notificationError.message);
      }
    });

    log.info("Message sent", { messageId: message._id, sender, receiver });
    return sendSuccess(res, message, "Message sent successfully", 201);
  } catch (error) {
    log.error("Send message error", error);
    return sendError(res, "Failed to send message", 500);
  }
};

/**
 * GET MESSAGES- Between two users with pagination
 */
exports.getMessages = async (req, res) => {
  try {
    const user1 = req.params.user1 || req.params.sender;
    const user2 = req.params.user2 || req.params.receiver;
    const { page = 1, limit = 50 } = req.query;

    // Validation
    if (!user1 || !user2) {
      return sendValidationError(res, "Both user IDs required");
    }

    const skip = (page - 1) * limit;

    // Get messages in conversation
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
      deleted: false, // Exclude soft-deleted messages
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
      deleted: false,
    });

    return sendSuccess(
      res,
      {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Messages retrieved successfully"
    );
  } catch (error) {
    log.error("Get messages error", error);
    return sendError(res, "Failed to retrieve messages", 500);
  }
};

/**
 * MARK MESSAGES AS SEEN
 */
exports.markAsSeen = async (req, res) => {
  try {
    const { sender, receiver, currentUser } = req.body;

    // Validation
    const errors = validateRequiredFields({ sender, receiver, currentUser }, ["sender", "receiver", "currentUser"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    // Security: currentUser must be either sender or receiver
    if (currentUser !== receiver && currentUser !== sender) {
      return sendError(res, "Not authorized to mark these messages", 403);
    }

    // Mark messages as seen (from opposite party to current user)
    const result = await Message.updateMany(
      {
        sender: currentUser === receiver ? sender : receiver,
        receiver: currentUser,
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    log.info("Messages marked as seen", { sender, receiver, markedCount: result.modifiedCount });

    return sendSuccess(
      res,
      { markedCount: result.modifiedCount },
      "Messages marked as seen"
    );
  } catch (error) {
    log.error("Mark as seen error", error);
    return sendError(res, "Failed to mark messages as seen", 500);
  }
};

/**
 * DELETE MESSAGE - Soft delete
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { uid } = req.body;

    // Validation
    if (!messageId || !uid) {
      return sendValidationError(res, "Message ID and user ID required");
    }

    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return sendError(res, "Message not found", 404);
    }

    // Authorization - only sender can delete
    if (message.sender !== uid) {
      return sendError(res, "Not authorized to delete this message", 403);
    }

    // Soft delete
    message.deleted = true;
    await message.save();

    log.info("Message deleted", { messageId, uid });
    return sendSuccess(res, { deletedMessageId: messageId }, "Message deleted successfully");
  } catch (error) {
    log.error("Delete message error", error);
    return sendError(res, "Failed to delete message", 500);
  }
};