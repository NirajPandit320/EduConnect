const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const {
  createEvent,
  getEvents,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");

// Create event with image upload
router.post("/", upload.single("image"), createEvent);

// Get all events (with pagination & filtering)
router.get("/", getEvents);

// Update event (image optional)
router.put("/:eventId", upload.single("image"), updateEvent);

// Join event
router.put("/:eventId/join", joinEvent);

// Leave event
router.put("/:eventId/leave", leaveEvent);

// Delete event
router.delete("/:eventId", deleteEvent);

module.exports = router;