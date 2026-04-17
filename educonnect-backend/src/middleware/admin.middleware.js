/**
 * Improved Admin Middleware
 * Validates admin sessions with timestamp verification
 * Prevents email spoofing
 */

const { ADMIN_EMAIL } = require("../config/admin");
const { validateSession, getSessionInfo } = require("../utils/adminSessions");
const { sendError } = require("../utils/response");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const extractSessionToken = (req) => {
  const authorization = req.headers.authorization;
  const sessionHeader = req.headers["x-admin-session"];
  const cookieToken = req.cookies?.adminSession;
  const rawToken = authorization || sessionHeader || cookieToken;

  if (!rawToken) {
    return null;
  }

  const token = String(rawToken).trim();
  if (token.toLowerCase().startsWith("bearer ")) {
    return token.slice(7).trim();
  }

  return token;
};

const isAdmin = (req, res, next) => {
  try {
    const sessionToken = extractSessionToken(req);
    const expectedAdminEmail = normalizeEmail(ADMIN_EMAIL);

    if (!sessionToken) {
      return sendError(res, "Missing admin credentials", 401);
    }

    if (!validateSession(sessionToken)) {
      return sendError(res, "Invalid or expired admin session", 401);
    }

    const session = getSessionInfo(sessionToken);
    const sessionEmail = normalizeEmail(session?.email);

    if (!sessionEmail || sessionEmail !== expectedAdminEmail) {
      return sendError(res, "User is not an admin", 403);
    }

    req.admin = {
      email: sessionEmail,
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
