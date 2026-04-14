/**
 * Job Controller Tests
 * Tests for admin-only operations and pagination
 */

const request = require('supertest');
const app = require('../../src/app');
const Job = require('../../src/models/Job');
const User = require('../../src/models/User');
const { testUsers, expectStandardResponse, expectUnauthorized, expectValidationError } = require('../utils');

describe('Job Endpoints', () => {
  let jobId;

  beforeAll(async () => {
    await Job.deleteMany({});
    await User.deleteMany({ uid: { $in: [testUsers.user1.uid, testUsers.user2.uid] } });

    // Create test users
    await User.create([
      { uid: testUsers.user1.uid, email: 'user1@test.com', name: 'User 1', branch: 'CSE', cgpa: 8.5, year: 4 },
      { uid: testUsers.user2.uid, email: 'user2@test.com', name: 'User 2', branch: 'CSE', cgpa: 7.5, year: 3 },
    ]);
  });

  afterAll(async () => {
    await Job.deleteMany({});
    await User.deleteMany({ uid: { $in: [testUsers.user1.uid, testUsers.user2.uid] } });
  });

  // ===== CREATE JOB =====
  describe('POST /api/jobs - Create Job', () => {
    test('should fail without admin flag (403)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Software Engineer',
          company: 'Tech Corp',
          ctc: 15,
          deadline: '2026-12-31',
          isAdmin: false,
        });

      expectUnauthorized(res);
      expect(res.body.message).toMatch(/only admins/i);
    });

    test('should create job with admin flag (201)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Software Engineer',
          company: 'Tech Corp',
          ctc: 15,
          deadline: '2026-12-31',
          description: 'Exciting opportunity',
          isAdmin: true,
        });

      expectStandardResponse(res, 201, true);
      expect(res.body.data.title).toBe('Software Engineer');
      expect(res.body.data.company).toBe('Tech Corp');
      expect(res.body.data.jobStatus).toBe('active');
      expect(res.body.data.applicationCount).toBe(0);

      jobId = res.body.data._id;
    });

    test('should fail without required fields (400)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          company: 'Tech Corp',
          isAdmin: true,
        });

      expectValidationError(res);
    });
  });

  // ===== GET JOBS =====
  describe('GET /api/jobs - List Jobs', () => {
    test('should return active jobs (200)', async () => {
      const res = await request(app)
        .get('/api/jobs?status=active&page=1&limit=10');

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('jobs');
      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('totalPages');
    });

    test('should filter status correctly', async () => {
      // Create expired job first
      await Job.create({
        title: 'Expired Job',
        company: 'Old Co',
        deadline: new Date('2020-01-01'),
        createdBy: 'admin',
      });

      const activeRes = await request(app)
        .get('/api/jobs?status=active');

      const expiredRes = await request(app)
        .get('/api/jobs?status=expired');

      expect(activeRes.body.data.jobs.some(j => j.deadline >= new Date())).toBe(true);
      expect(expiredRes.body.data.jobs.length).toBeGreaterThan(0);
    });

    test('should respect pagination', async () => {
      const res = await request(app)
        .get('/api/jobs?page=1&limit=5');

      expectStandardResponse(res, 200, true);
      expect(res.body.data.jobs.length).toBeLessThanOrEqual(5);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  // ===== CHECK ELIGIBILITY =====
  describe('GET /api/jobs/eligibility/:uid - Check Eligibility', () => {
    test('should return eligible and not eligible jobs', async () => {
      const res = await request(app)
        .get(`/api/jobs/eligibility/${testUsers.user1.uid}`);

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('eligibleJobs');
      expect(res.body.data).toHaveProperty('notEligibleJobs');
      expect(Array.isArray(res.body.data.eligibleJobs)).toBe(true);
      expect(Array.isArray(res.body.data.notEligibleJobs)).toBe(true);
    });

    test('should fail with non-existent user (404)', async () => {
      const res = await request(app)
        .get('/api/jobs/eligibility/non_existent_uid');

      expect(res.status).toBe(404);
    });
  });

  // ===== GET SINGLE JOB =====
  describe('GET /api/jobs/:id - Get Single Job', () => {
    test('should return job details (200)', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}`);

      expectStandardResponse(res, 200, true);
      expect(res.body.data._id).toBe(jobId.toString());
    });

    test('should fail with invalid job id (404)', async () => {
      const res = await request(app)
        .get('/api/jobs/invalid_id');

      expect(res.status).toBe(404);
    });
  });

  // ===== DELETE JOB =====
  describe('DELETE /api/jobs/:id - Delete Job', () => {
    test('should fail for non-admin (403)', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${jobId}`)
        .send({
          isAdmin: false,
        });

      expectUnauthorized(res);
      expect(res.body.message).toMatch(/only admins/i);
    });

    test('should delete job as admin (200)', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${jobId}`)
        .send({
          isAdmin: true,
        });

      expectStandardResponse(res, 200, true);
      expect(res.body.data).toHaveProperty('deletedJobId');

      // Verify deletion
      const checkRes = await request(app)
        .get(`/api/jobs/${jobId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
