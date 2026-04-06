const Message = require("../models/Message");
const User = require("../models/User");
const { createAndEmitNotification } = require("./notification.controller");

// SEND MESSAGE

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

    if (!sender || !receiver) {
      return res.status(400).json({
        message: "Sender and receiver required",
      });
    }

    const resolvedMessageType =
      messageType ||
      (call ? "call" : file ? "file" : "text");

    if (!text && !file && resolvedMessageType !== "call") {
      return res.status(400).json({
        message: "Message text, file, or call payload is required",
      });
    }

    const message = await Message.create({
      sender,
      receiver,
      text,
      file,
      fileName,
      fileType,
      messageType: resolvedMessageType,
      call,
    });

    try {
      const senderUser = await User.findOne({ uid: sender });
      const io = req.app.get("io");

      await createAndEmitNotification(io, {
        userId: receiver,
        senderId: sender,
        type: "message",
        text: `${senderUser?.name || senderUser?.email || "Someone"} sent you a message`,
        link: "/chat",
      });
    } catch (notificationError) {
      console.log("Notification create failed:", notificationError.message);
    }

    res.status(201).json({
      message: "Message sent",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Send failed",
      error: error.message,
    });
  }
};

// GET MESSAGES BETWEEN USERS

exports.getMessages = async (req, res) => {
  try {
    const user1 = req.params.user1 || req.params.sender;
    const user2 = req.params.user2 || req.params.receiver;

    if (!user1 || !user2) {
      return res.status(400).json({
        message: "Both user IDs are required",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Fetch failed",
      error: error.message,
    });
  }
};

//MarkAsSeen


exports.markAsSeen = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({
        message: "Sender and receiver are required",
      });
    }

    await Message.updateMany(
      { sender, receiver, seen: false },
      { seen: true }
    );

    res.status(200).json({
      message: "Messages marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking messages as seen",
      error: error.message,
    });
  }
};