/**
 * Admin Session Management
 * Tracks admin sessions with timestamp validation and TTL
 * Simple in-memory implementation (can be upgraded to Redis for multi-server)
 */

const sessions = new Map(); // Map<sessionToken, {email, createdAt, expiresAt|null}>

// By default, admin sessions remain valid until explicit logout.
// Set ADMIN_SESSION_TTL_MS to a positive integer (ms) to enable expiration.
const parsedSessionTtl = Number(process.env.ADMIN_SESSION_TTL_MS);
const SESSION_TTL_MS = Number.isFinite(parsedSessionTtl) && parsedSessionTtl > 0
  ? parsedSessionTtl
  : null;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

/**
 * Create a new admin session
 * @param {string} email - Admin email
 * @returns {string} sessionToken
 */
const createSession = (email) => {
  const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  const expiresAt = SESSION_TTL_MS ? now + SESSION_TTL_MS : null;

  sessions.set(sessionToken, {
    email: normalizeEmail(email),
    createdAt: now,
    expiresAt,
  });

  // Clean up expired sessions periodically
  cleanupExpiredSessions();

  return sessionToken;
};

/**
 * Validate an admin session
 * @param {string} sessionToken - Session token to validate
 * @param {string} [email] - Optional email to verify against session
 * @returns {boolean} true if valid
 */
const validateSession = (sessionToken, email) => {
  if (!sessionToken || !sessions.has(sessionToken)) {
    return false;
  }

  const session = sessions.get(sessionToken);
  const now = Date.now();

  // Check expiration
  if (session.expiresAt && now > session.expiresAt) {
    sessions.delete(sessionToken);
    return false;
  }

  // If email is provided, verify match.
  if (email && session.email !== normalizeEmail(email)) {
    return false;
  }

  return true;
};

/**
 * Destroy an admin session (logout)
 * @param {string} sessionToken - Session token to destroy
 */
const destroySession = (sessionToken) => {
  sessions.delete(sessionToken);
};

/**
 * Cleanup expired sessions
 */
const cleanupExpiredSessions = () => {
  const now = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt && now > session.expiresAt) {
      sessions.delete(token);
    }
  }
};

/**
 * Get session info (for debugging)
 * @param {string} sessionToken - Session token
 * @returns {object|null} session info or null
 */
const getSessionInfo = (sessionToken) => {
  return sessions.get(sessionToken) || null;
};

module.exports = {
  createSession,
  validateSession,
  destroySession,
  getSessionInfo,
  SESSION_TTL_MS,
};
