const express = require("express");
const router = express.Router();

const {sendMessage,getMessages} = require("../controllers/message.controller");
const { markAsSeen } = require("../controllers/message.controller");

// SEND MESSAGE
router.post("/", sendMessage);

// GET CHAT BETWEEN 2 USERS
router.get("/:user1/:user2", getMessages);
router.post("/seen", markAsSeen);

module.exports = router;