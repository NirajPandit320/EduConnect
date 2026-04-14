/**
 * Admin Session Management
 * Tracks admin sessions with timestamp validation and TTL
 * Simple in-memory implementation (can be upgraded to Redis for multi-server)
 */

const sessions = new Map(); // Map<sessionToken, {email, timestamp, expiresAt}>
const SESSION_TTL_MS = 3600000; // 1 hour in milliseconds

/**
 * Create a new admin session
 * @param {string} email - Admin email
 * @returns {string} sessionToken
 */
const createSession = (email) => {
  const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  sessions.set(sessionToken, {
    email,
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
 * @param {string} email - Email to verify against session
 * @returns {boolean} true if valid
 */
const validateSession = (sessionToken, email) => {
  if (!sessionToken || !sessions.has(sessionToken)) {
    return false;
  }

  const session = sessions.get(sessionToken);
  const now = Date.now();

  // Check expiration
  if (now > session.expiresAt) {
    sessions.delete(sessionToken);
    return false;
  }

  // Check email match
  if (session.email !== email) {
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
    if (now > session.expiresAt) {
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
