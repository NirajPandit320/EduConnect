const express = require("express");
const router = express.Router();

const {
	sendMessage,
	getMessages,
	markAsSeen,
} = require("../controllers/message.controller");

// SEND MESSAGE
router.post("/", sendMessage);

// GET CHAT BETWEEN 2 USERS
router.get("/:user1/:user2", getMessages);

// MARK MESSAGES AS SEEN
router.post("/seen", markAsSeen);

module.exports = router;