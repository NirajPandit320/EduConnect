const express = require("express");
const router = express.Router();

const {
	sendMessage,
	getMessages,
	markAsSeen,
	deleteMessage,
} = require("../controllers/message.controller");

// Send message
router.post("/", sendMessage);

// Get chat between 2 users (with pagination)
router.get("/:user1/:user2", getMessages);

// Mark messages as seen (PUT instead of POST for idempotency)
router.put("/seen", markAsSeen);

// Delete message
router.delete("/:messageId", deleteMessage);

module.exports = router;