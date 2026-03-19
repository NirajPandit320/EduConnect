
// CREATE EVENT (Admin)
const Event = require("../models/Event");

// CREATE EVENT
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, uid } = req.body;

    // ✅ Validation
    if (!title || !date || !uid) {
      return res.status(400).json({
        message: "Title, date and uid are required",
      });
    }

    // ✅ Parse date
    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // ✅ Debug (temporary)
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const newEvent = new Event({
      title,
      description,
      date: parsedDate, // ✅ FIXED
      location,
      createdBy: uid,
      image: req.file ? req.file.filename : "", // ✅ correct
      // participants will auto default if model set
    });

    await newEvent.save();

    res.status(201).json(newEvent);

  } catch (error) {
    console.log("CREATE EVENT ERROR:", error);
    res.status(500).json({
      message: "Error creating event",
      error: error.message,
    });
  }
};
// GET ALL EVENTS
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    res.json(events);

  } catch (error) {
    res.status(500).json({
      message: "Fetch failed",
      error: error.message,
    });
  }
};

// JOIN EVENT
exports.joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.body) {
      return res.status(400).json({
        message: "Request body missing",
      });
    }

    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        message: "UID is required",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.participants.includes(uid)) {
      return res.status(400).json({
        message: "Already joined",
      });
    }

    event.participants.push(uid);
    await event.save();

    res.json(event);

  } catch (error) {
    res.status(500).json({
      message: "Join failed",
      error: error.message,
    });
  }
};

// LEAVE EVENT
exports.leaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid } = req.body;

    const event = await Event.findById(eventId);

    event.participants = event.participants.filter(
      (id) => id !== uid
    );

    await event.save();

    res.json(event);

  } catch (error) {
    res.status(500).json({
      message: "Leave failed",
      error: error.message,
    });
  }
};
