const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const {
  createEvent,
  getEvents,
  joinEvent,
  leaveEvent,
} = require("../controllers/event.controller");

// Create event with image upload
router.post("/", upload.single("image"), createEvent);

// Get all events
router.get("/", getEvents);

// Join event
router.put("/:eventId/join", joinEvent);

// Leave event
router.put("/:eventId/leave", leaveEvent);

module.exports = router;