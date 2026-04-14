const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/admin");
const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");
const { createSession, destroySession } = require("../utils/adminSessions");
const { sendSuccess, sendError } = require("../utils/response");
const log = require("../utils/logger");

/**
 * Admin Login
 * Validates credentials and creates session
 */
exports.adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create session
      const sessionToken = createSession(email);

      log.info("Admin login successful", { email });

      return sendSuccess(
        res,
        {
          sessionToken,
          email,
          message: "Admin login successful",
        },
        "Login successful",
        200
      );
    }

    log.warn("Failed admin login attempt", { email });

    return sendError(res, "Invalid admin credentials", 401);
  } catch (error) {
    log.error("Admin login error", error);
    return sendError(res, "An error occurred during login", 500);
  }
};

/**
 * Admin Logout
 * Destroys session
 */
exports.adminLogout = (req, res) => {
  try {
    const sessionToken = req.headers.authorization || req.headers["x-admin-session"];

    if (sessionToken) {
      destroySession(sessionToken);
    }

    log.info("Admin logout successful", { email: req.admin?.email });

    return sendSuccess(res, null, "Logout successful", 200);
  } catch (error) {
    log.error("Admin logout error", error);
    return sendError(res, "An error occurred during logout", 500);
  }
};

/**
 * Get Admin Dashboard Statistics
 */
exports.getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const posts = await Post.countDocuments();
    const events = await Event.countDocuments();

    return sendSuccess(
      res,
      {
        users,
        posts,
        events,
      },
      "Stats retrieved successfully"
    );
  } catch (error) {
    log.error("Failed to get admin stats", error);
    return sendError(res, "Failed to retrieve statistics", 500);
  }
};

/**
 * Delete Post (Admin)
 */
exports.deletePostAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, "Post ID is required", 400);
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return sendError(res, "Post not found", 404);
    }

    log.info("Admin deleted post", { postId: id, admin: req.admin?.email });

    return sendSuccess(res, { deletedPostId: id }, "Post deleted successfully");
  } catch (error) {
    log.error("Failed to delete post", error);
    return sendError(res, "Failed to delete post", 500);
  }
};

/**
 * Delete Event (Admin)
 */
exports.deleteEventAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, "Event ID is required", 400);
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    log.info("Admin deleted event", { eventId: id, admin: req.admin?.email });

    return sendSuccess(res, { deletedEventId: id }, "Event deleted successfully");
  } catch (error) {
    log.error("Failed to delete event", error);
    return sendError(res, "Failed to delete event", 500);
  }
};