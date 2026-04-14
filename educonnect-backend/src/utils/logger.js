/**
 * Simple Logger Utility
 * Replaces console.log throughout the application
 * Can be enhanced with Winston/Morgan in future
 */

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

const getTimestamp = () => new Date().toISOString();

const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  if (data) {
    return `[${timestamp}] ${level}: ${message} | ${JSON.stringify(data)}`;
  }
  return `[${timestamp}] ${level}: ${message}`;
};

const log = {
  error: (message, data = null) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },

  warn: (message, data = null) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },

  info: (message, data = null) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === "development") {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },

  request: (method, url, statusCode) => {
    const timestamp = getTimestamp();
    console.log(`[${timestamp}] ${method} ${url} - ${statusCode}`);
  },
};

module.exports = log;
