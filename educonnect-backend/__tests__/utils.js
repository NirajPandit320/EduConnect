/**
 * Test Utilities
 * Common functions for API testing
 */

const request = require('supertest');
const app = require('../src/app');

/**
 * Test user data
 */
const testUsers = {
  user1: { uid: 'test_user_1', email: 'user1@test.com', name: 'Test User 1' },
  user2: { uid: 'test_user_2', email: 'user2@test.com', name: 'Test User 2' },
  admin: { uid: 'admin_uid', email: 'admin@educonnect.com', isAdmin: true },
};

/**
 * Make API request with error handling
 */
const apiRequest = (method, endpoint, data = null, headers = {}) => {
  let req = request(app)[method](endpoint);

  if (headers && Object.keys(headers).length > 0) {
    Object.entries(headers).forEach(([key, value]) => {
      req = req.set(key, value);
    });
  }

  if (data) {
    req = req.send(data);
  }

  return req;
};

/**
 * Assert standardized response format
 */
const expectStandardResponse = (response, expectedStatus, hasData = true) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('message');

  if (expectedStatus === 200 || expectedStatus === 201) {
    expect(response.body.success).toBe(true);
    if (hasData) expect(response.body).toHaveProperty('data');
  } else {
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('error');
  }
};

/**
 * Assert authorization failure
 */
const expectUnauthorized = (response) => {
  expectStandardResponse(response, 403, false);
  expect(response.body.message).toMatch(/not authorized|forbidden|not allowed/i);
};

/**
 * Assert validation error
 */
const expectValidationError = (response) => {
  expectStandardResponse(response, 400, false);
  expect(response.body.message).toMatch(/validation|required|invalid/i);
};

/**
 * Assert not found error
 */
const expectNotFound = (response) => {
  expectStandardResponse(response, 404, false);
  expect(response.body.message).toMatch(/not found/i);
};

/**
 * Verify XSS protection (script tags removed)
 */
const expectXSSProtection = (text) => {
  expect(text).not.toMatch(/<script>/i);
  expect(text).not.toMatch(/onclick/i);
  expect(text).not.toMatch(/onerror/i);
};

module.exports = {
  testUsers,
  apiRequest,
  expectStandardResponse,
  expectUnauthorized,
  expectValidationError,
  expectNotFound,
  expectXSSProtection,
};
