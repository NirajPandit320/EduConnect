// Event Controller - Production Ready with Authorization
const Event = require("../models/Event");
const User = require("../models/User");
const { createAndEmitNotification } = require("./notification.controller");
const { sendSuccess, sendError, sendValidationError } = require("../utils/response");
const { validateRequiredFields, validateDateFormat } = require("../utils/validators");
const log = require("../utils/logger");
const { getStoredFileReference } = require("../utils/fileUpload");

/**
 * CREATE EVENT - Admin only
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, uid, capacity, endDate } = req.body;

    // Validation
    const errors = validateRequiredFields({ title, date, uid }, ["title", "date", "uid"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    // Date validation
    if (!validateDateFormat(date)) {
      return sendValidationError(res, "Invalid date format");
    }

    // Parse dates
    const parsedDate = new Date(date);
    const parsedEndDate = endDate ? new Date(endDate) : null;

    // Verify user exists (who created the event)
    const creator = await User.findOne({ uid });
    if (!creator) {
      return sendError(res, "User not found", 404);
    }

    // Create event
    const image = req.file
      ? await getStoredFileReference(req.file, "educonnect/events", "image")
      : "";

    const newEvent = new Event({
      title: title.trim(),
      description: description?.trim() || "",
      date: parsedDate,
      endDate: parsedEndDate,
      location: location?.trim() || "",
      createdBy: uid,
      image,
      capacity: capacity ? parseInt(capacity) : null,
      eventStatus: "active",
      participants: [],
    });

    await newEvent.save();

    // Send notifications (non-blocking)
    setImmediate(async () => {
      try {
        const io = req.app.get("io");
        if (!io) return;

        const otherUsers = await User.find({ uid: { $ne: uid } }).select("uid");

        await Promise.allSettled(
          otherUsers.map((user) =>
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
        log.warn("Event create notification failed", notificationError.message);
      }
    });

    log.info("Event created", { eventId: newEvent._id, uid });
    return sendSuccess(res, newEvent, "Event created successfully", 201);
  } catch (error) {
    log.error("Create event error", error);
    return sendError(res, "Failed to create event", 500);
  }
};

/**
 * GET ALL EVENTS - With pagination and filtering
 */
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "active" } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { eventStatus: status } : {};

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    return sendSuccess(
      res,
      {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Events retrieved successfully"
    );
  } catch (error) {
    log.error("Get events error", error);
    return sendError(res, "Failed to retrieve events", 500);
  }
};

/**
 * JOIN EVENT - User joins event
 */
exports.joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid } = req.body;

    // Validation
    if (!eventId || !uid) {
      return sendValidationError(res, "Event ID and user ID required");
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Check event status
    if (event.eventStatus !== "active") {
      return sendError(res, "Cannot join inactive event", 400);
    }

    // Check capacity
    if (event.capacity && event.participants.length >= event.capacity) {
      return sendError(res, "Event is full", 400);
    }

    // Check if already joined
    if (event.participants.includes(uid)) {
      return sendError(res, "Already joined this event", 400);
    }

    // Add participant
    event.participants.push(uid);
    await event.save();

    // Send notifications
    setImmediate(async () => {
      try {
        const io = req.app.get("io");
        if (!io) return;

        const joiningUser = await User.findOne({ uid });

        // Notify event creator
        await createAndEmitNotification(io, {
          userId: event.createdBy,
          senderId: uid,
          type: "event",
          text: `${joiningUser?.name || joiningUser?.email || "Someone"} joined your event: ${event.title}`,
          link: "/events",
        });

        // Notify user
        await createAndEmitNotification(io, {
          userId: uid,
          senderId: event.createdBy,
          type: "event",
          text: `You joined ${event.title}`,
          link: "/events",
        });
      } catch (notificationError) {
        log.warn("Join event notification failed", notificationError.message);
      }
    });

    log.info("User joined event", { eventId, uid, participantCount: event.participants.length });
    return sendSuccess(res, event, "Successfully joined event");
  } catch (error) {
    log.error("Join event error", error);
    return sendError(res, "Failed to join event", 500);
  }
};

/**
 * LEAVE EVENT - User leaves event
 */
exports.leaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid } = req.body;

    // Validation
    if (!eventId || !uid) {
      return sendValidationError(res, "Event ID and user ID required");
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Check if user is participant
    if (!event.participants.includes(uid)) {
      return sendError(res, "Not a participant of this event", 400);
    }

    // Remove participant
    event.participants = event.participants.filter((id) => id !== uid);
    await event.save();

    log.info("User left event", { eventId, uid, participantCount: event.participants.length });
    return sendSuccess(res, event, "Successfully left event");
  } catch (error) {
    log.error("Leave event error", error);
    return sendError(res, "Failed to leave event", 500);
  }
};

/**
 * UPDATE EVENT - Only event creator
 */
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, title, description, date, location, endDate, capacity, eventStatus } = req.body;

    // Validation
    if (!eventId || !uid) {
      return sendValidationError(res, "Event ID and user ID required");
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Authorization - only creator can edit
    if (event.createdBy !== uid) {
      return sendError(res, "Not authorized to edit this event", 403);
    }

    // Update fields
    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (date && validateDateFormat(date)) event.date = new Date(date);
    if (endDate && validateDateFormat(endDate)) event.endDate = new Date(endDate);
    if (location) event.location = location.trim();
    if (capacity) event.capacity = parseInt(capacity);
    if (eventStatus && ["active", "cancelled", "completed"].includes(eventStatus)) {
      event.eventStatus = eventStatus;
    }
    if (req.file) {
      event.image = await getStoredFileReference(req.file, "educonnect/events", "image");
    }

    await event.save();

    log.info("Event updated", { eventId, uid });
    return sendSuccess(res, event, "Event updated successfully");
  } catch (error) {
    log.error("Update event error", error);
    return sendError(res, "Failed to update event", 500);
  }
};

/**
 * DELETE EVENT - Only event creator or admin
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, isAdmin = false } = req.body;

    // Validation
    if (!eventId || !uid) {
      return sendValidationError(res, "Event ID and user ID required");
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Authorization - only creator or admin
    if (event.createdBy !== uid && !isAdmin) {
      return sendError(res, "Not authorized to delete this event", 403);
    }

    // Delete
    await Event.findByIdAndDelete(eventId);

    log.info("Event deleted", { eventId, uid, isAdmin });
    return sendSuccess(res, { deletedEventId: eventId }, "Event deleted successfully");
  } catch (error) {
    log.error("Delete event error", error);
    return sendError(res, "Failed to delete event", 500);
  }
};
