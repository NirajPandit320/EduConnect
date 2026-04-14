/**
 * Admin Configuration
 * Load from environment variables for security
 */

module.exports = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@educonnect.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Gayatri@#$123321", // Should be hashed in production
};
