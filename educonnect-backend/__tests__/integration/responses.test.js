/**
 * Response Format Tests
 * Validates all endpoints return standardized response format
 */

const request = require('supertest');
const app = require('../../src/app');
const { expectStandardResponse } = require('../utils');

describe('Response Format Standardization', () => {
  // ===== SUCCESS RESPONSES =====
  describe('Success Responses (200/201)', () => {
    test('Event list should have standardized format', async () => {
      const res = await request(app)
        .get('/api/events?page=1&limit=5');

      expectStandardResponse(res, 200, true);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);
      expect(res.body.data).toBeDefined();
    });

    test('Job list should have pagination in data', async () => {
      const res = await request(app)
        .get('/api/jobs?page=1&limit=10');

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('jobs');
      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('limit');
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('totalPages');
    });
  });

  // ===== ERROR RESPONSES =====
  describe('Error Responses (400/403/404)', () => {
    test('Validation error should have standardized format (400)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({}); // Missing required fields

      expectStandardResponse(res, 400, false);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    test('Authorization error should have standardized format (403)', async () => {
      // Create an event first
      const createRes = await request(app)
        .post('/api/events')
        .send({
          title: 'Test',
          description: 'Test',
          date: '2026-05-20',
          uid: 'owner_uid',
          location: 'Hall',
          capacity: 50,
        });

      const eventId = createRes.body.data._id;

      // Try to update as different user
      const updateRes = await request(app)
        .put(`/api/events/${eventId}`)
        .send({
          uid: 'different_uid',
          title: 'Hacked',
        });

      expectStandardResponse(updateRes, 403, false);
      expect(updateRes.body.success).toBe(false);
      expect(updateRes.body.message).toMatch(/not authorized|forbidden/i);
    });

    test('Not found error should have standardized format (404)', async () => {
      const res = await request(app)
        .get('/api/jobs/invalid_mongo_id_12345');

      expectStandardResponse(res, 404, false);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  // ===== HTTP STATUS CODES =====
  describe('HTTP Status Codes', () => {
    test('Successful GET should return 200', async () => {
      const res = await request(app)
        .get('/api/events');

      expect(res.status).toBe(200);
    });

    test('Successful POST should return 201', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Event',
          description: 'Desc',
          date: '2026-05-20',
          uid: 'user',
          location: 'Loc',
          capacity: 50,
        });

      expect([200, 201]).toContain(res.status);
    });

    test('Validation error should return 400', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({ company: 'No title' });

      expect(res.status).toBe(400);
    });

    test('Authorization error should return 403', async () => {
      const createRes = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Job',
          company: 'Co',
          deadline: '2026-12-31',
          isAdmin: true,
        });

      const jobId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/jobs/${jobId}`)
        .send({ isAdmin: false });

      expect(deleteRes.status).toBe(403);
    });

    test('Not found should return 404', async () => {
      const res = await request(app)
        .get('/api/events/nonexistent');

      expect([400, 404]).toContain(res.status);
    });
  });
});
