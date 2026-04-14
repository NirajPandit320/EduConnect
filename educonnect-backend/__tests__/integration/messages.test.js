/**
 * Message Controller Tests
 * Tests for XSS protection, authorization, and standardized responses
 */

const request = require('supertest');
const app = require('../../src/app');
const Message = require('../../src/models/Message');
const User = require('../../src/models/User');
const { testUsers, expectStandardResponse, expectUnauthorized, expectValidationError, expectXSSProtection } = require('../utils');

describe('Message Endpoints', () => {
  let messageId;
  const sender = testUsers.user1.uid;
  const receiver = testUsers.user2.uid;

  beforeAll(async () => {
    // Clear collections
    await Message.deleteMany({});
    await User.deleteMany({ uid: { $in: [sender, receiver] } });

    // Create test users
    await User.create([
      { uid: sender, email: 'user1@test.com', name: 'User 1' },
      { uid: receiver, email: 'user2@test.com', name: 'User 2' },
    ]);
  });

  afterAll(async () => {
    await Message.deleteMany({});
    await User.deleteMany({ uid: { $in: [sender, receiver] } });
  });

  // ===== SEND MESSAGE =====
  describe('POST /api/messages - Send Message', () => {
    test('should send message with valid data (201)', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          sender,
          receiver,
          text: 'Hello, this is a test message',
          messageType: 'text',
        });

      expectStandardResponse(res, 201, true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.sender).toBe(sender);
      expect(res.body.data.receiver).toBe(receiver);
      expect(res.body.data.text).toBe('Hello, this is a test message');
      expect(res.body.data.seen).toBe(false);

      messageId = res.body.data._id;
    });

    test('should sanitize XSS in message text (201)', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          sender,
          receiver,
          text: '<script>alert("XSS")</script>Hello',
          messageType: 'text',
        });

      expectStandardResponse(res, 201, true);
      expectXSSProtection(res.body.data.text);
      expect(res.body.data.text).not.toMatch(/<script>/i);
    });

    test('should fail without sender (400)', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          receiver,
          text: 'No sender',
        });

      expectValidationError(res);
    });

    test('should fail without receiver (400)', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          sender,
          text: 'No receiver',
        });

      expectValidationError(res);
    });

    test('should fail with non-existent sender (404)', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          sender: 'non_existent_user',
          receiver,
          text: 'Test',
        });

      expect(res.status).toBe(404);
    });
  });

  // ===== GET MESSAGES =====
  describe('GET /api/messages/:user1/:user2 - Get Chat History', () => {
    test('should return messages with pagination (200)', async () => {
      const res = await request(app)
        .get(`/api/messages/${sender}/${receiver}?page=1&limit=10`);

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.messages)).toBe(true);
    });

    test('should include both directions of conversation', async () => {
      // Send message in opposite direction
      await request(app)
        .post('/api/messages')
        .send({
          sender: receiver,
          receiver: sender,
          text: 'Reply message',
        });

      const res = await request(app)
        .get(`/api/messages/${sender}/${receiver}`);

      expectStandardResponse(res, 200, true);
      const messages = res.body.data.messages;
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===== MARK AS SEEN =====
  describe('PUT /api/messages/seen - Mark Messages as Seen', () => {
    test('should mark messages as seen (200)', async () => {
      const res = await request(app)
        .put('/api/messages/seen')
        .send({
          sender: receiver,
          receiver: sender,
          currentUser: sender,
        });

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('markedCount');
    });

    test('should fail without currentUser (400)', async () => {
      const res = await request(app)
        .put('/api/messages/seen')
        .send({
          sender: receiver,
          receiver: sender,
        });

      expectValidationError(res);
    });
  });

  // ===== DELETE MESSAGE =====
  describe('DELETE /api/messages/:id - Delete Message', () => {
    test('should delete own message as sender (200)', async () => {
      const res = await request(app)
        .delete(`/api/messages/${messageId}`)
        .send({
          uid: sender,
        });

      expectStandardResponse(res, 200, true);

      // Verify soft delete (message still exists but marked deleted)
      const checkRes = await request(app)
        .get(`/api/messages/${sender}/${receiver}`);
      const deletedMsg = checkRes.body.data.messages.find(m => m._id.toString() === messageId.toString());
      expect(deletedMsg.deleted).toBe(true);
    });

    test('should fail to delete others message (403)', async () => {
      // Create a new message first
      const msgRes = await request(app)
        .post('/api/messages')
        .send({
          sender,
          receiver,
          text: 'Message to try delete from other user',
        });

      const newMessageId = msgRes.body.data._id;

      // Try to delete as receiver (non-sender)
      const res = await request(app)
        .delete(`/api/messages/${newMessageId}`)
        .send({
          uid: receiver,
        });

      expectUnauthorized(res);
    });
  });
});
