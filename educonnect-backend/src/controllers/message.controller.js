const Message = require("../models/Message");

// SEND MESSAGE

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({
        message: "Sender and receiver required",
      });
    }

    const message = await Message.create({
      sender,
      receiver,
      text,
    });

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
    const { user1, user2 } = req.params;

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