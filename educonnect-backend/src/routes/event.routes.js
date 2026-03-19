const express = require("express");
const upload = require("../middleware/upload.middleware");
const router = express.Router();


const {
  createEvent,
  getEvents,
  joinEvent,
  leaveEvent,
} = require("../controllers/event.controller");

router.post("/", upload.single("image"), createEvent);

router.get("/", getEvents);

router.put("/:eventId/join", joinEvent);

router.put("/:eventId/leave", leaveEvent);


module.exports = router;