/**
 * Improved Admin Middleware
 * Validates admin sessions with timestamp verification
 * Prevents email spoofing
 */

const { ADMIN_EMAIL } = require("../config/admin");
const { validateSession } = require("../utils/adminSessions");
const { sendError } = require("../utils/response");

const isAdmin = (req, res, next) => {
  try {
    // Get session token from header or cookie
    const sessionToken = req.headers.authorization || req.headers["x-admin-session"] || req.cookies?.adminSession;
    const email = req.headers.email || req.body.email || req.query.email;

    // Validate required fields
    if (!sessionToken || !email) {
      return sendError(res, "Missing admin credentials", 401);
    }

    // Validate session
    if (!validateSession(sessionToken, email)) {
      return sendError(res, "Invalid or expired admin session", 401);
    }

    // Additional check - ensure email is admin email
    if (email !== ADMIN_EMAIL) {
      return sendError(res, "User is not an admin", 403);
    }

    // Attach admin info to request
    req.admin = {
      email,
      sessionToken,
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return sendError(res, "Authentication error", 500);
  }
};

module.exports = isAdmin;
