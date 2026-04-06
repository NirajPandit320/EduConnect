
// CREATE EVENT (Admin)
const Event = require("../models/Event");
const User = require("../models/User");
const { createAndEmitNotification } = require("./notification.controller");

// CREATE EVENT
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, uid } = req.body;

    //  Validation
    if (!title || !date || !uid) {
      return res.status(400).json({
        message: "Title, date and uid are required",
      });
    }

    //  Parse date
    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // Debug (temporary)
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const newEvent = new Event({
      title,
      description,
      date: parsedDate, //  Parse date
      location,
      createdBy: uid,
      image: req.file ? req.file.filename : "", //  Correctly handle file upload (if using multer) - ensure multer is set up to handle 'image' field in the route, and that it saves the file with a filename property.
      // participants will auto default if model set
    });

    await newEvent.save();

    try {
      const io = req.app.get("io");
      const users = await User.find({ uid: { $ne: uid } }).select("uid");

      await Promise.all(
        users.map((user) =>
          createAndEmitNotification(io, {
            userId: user.uid,
            senderId: uid,
            type: "event",
            text: `New event published: ${title}`,
            link: "/events",
          })
        )
      );
    } catch (notificationError) {
      console.log("Event create notification failed:", notificationError.message);
    }

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

    try {
      const io = req.app.get("io");
      const joiningUser = await User.findOne({ uid });

      await createAndEmitNotification(io, {
        userId: event.createdBy,
        senderId: uid,
        type: "event",
        text: `${joiningUser?.name || joiningUser?.email || "Someone"} joined your event: ${event.title}`,
        link: "/events",
      });

      await createAndEmitNotification(io, {
        userId: uid,
        senderId: event.createdBy,
        type: "event",
        text: `You joined ${event.title}`,
        link: "/events",
      });
    } catch (notificationError) {
      console.log("Join event notification failed:", notificationError.message);
    }

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
