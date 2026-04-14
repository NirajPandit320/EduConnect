/**
 * Admin Configuration
 * Loads admin credentials from environment variables
 */

module.exports = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@educonnect.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Gayatri@#$123321",
};
