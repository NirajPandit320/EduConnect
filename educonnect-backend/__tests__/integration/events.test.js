/**
 * Event Controller Tests
 * Tests for POST, GET, PUT, DELETE operations with authorization checks
 */

const request = require('supertest');
const app = require('../../src/app');
const Event = require('../../src/models/Event');
const { testUsers, expectStandardResponse, expectUnauthorized, expectValidationError } = require('../utils');

describe('Event Endpoints', () => {
  let eventId;

  beforeAll(async () => {
    // Clear events collection before tests
    await Event.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup
    await Event.deleteMany({});
  });

  // ===== CREATE EVENT =====
  describe('POST /api/events - Create Event', () => {
    test('should create event with valid data (201)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Test Event',
          description: 'Test Description',
          date: '2026-05-20',
          location: 'Test Hall',
          uid: testUsers.user1.uid,
          capacity: 50,
        });

      expectStandardResponse(res, 201, true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe('Test Event');
      expect(res.body.data.eventStatus).toBe('active');
      expect(res.body.data.createdBy).toBe(testUsers.user1.uid);

      eventId = res.body.data._id;
    });

    test('should fail without title (400)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          description: 'Missing title',
          date: '2026-05-20',
          uid: testUsers.user1.uid,
        });

      expectValidationError(res);
    });

    test('should fail without date (400)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'No Date Event',
          uid: testUsers.user1.uid,
        });

      expectValidationError(res);
    });
  });

  // ===== GET EVENTS =====
  describe('GET /api/events - List Events', () => {
    test('should return events with pagination (200)', async () => {
      const res = await request(app)
        .get('/api/events?page=1&limit=10');

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('events');
      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('limit');
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('totalPages');
    });

    test('should respect pagination limit', async () => {
      const res = await request(app)
        .get('/api/events?page=1&limit=5');

      expectStandardResponse(res, 200, true);
      expect(res.body.data.events.length).toBeLessThanOrEqual(5);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/events?status=active');

      expectStandardResponse(res, 200, true);
      expect(res.body.data.events.every(e => e.eventStatus === 'active')).toBe(true);
    });
  });

  // ===== UPDATE EVENT =====
  describe('PUT /api/events/:id - Update Event', () => {
    test('should update event as owner (200)', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .send({
          uid: testUsers.user1.uid,
          title: 'Updated Title',
        });

      expectStandardResponse(res, 200, true);
      expect(res.body.data.title).toBe('Updated Title');
    });

    test('should fail update by non-owner (403)', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .send({
          uid: testUsers.user2.uid,
          title: 'Hacked Title',
        });

      expectUnauthorized(res);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    test('should fail update without uid (400)', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .send({
          title: 'No UID',
        });

      expectValidationError(res);
    });
  });

  // ===== DELETE EVENT =====
  describe('DELETE /api/events/:id - Delete Event', () => {
    test('should fail delete by non-owner (403)', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .send({
          uid: testUsers.user2.uid,
        });

      expectUnauthorized(res);
    });

    test('should delete event as owner (200)', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .send({
          uid: testUsers.user1.uid,
        });

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('deletedEventId');

      // Verify deletion
      const checkRes = await request(app).get(`/api/events/${eventId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
