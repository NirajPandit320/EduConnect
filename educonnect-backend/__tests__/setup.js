/**
 * Jest Setup File
 * Runs before all tests to configure test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educonnect-test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.SESSION_TTL_MS = '3600000';
process.env.ADMIN_EMAIL = 'admin@educonnect.com';
process.env.ADMIN_PASSWORD = 'Gayatri@#$123321';

// Suppress console.log during tests (only show errors and warnings)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
};

// Increase timeout for database operations
jest.setTimeout(30000);
