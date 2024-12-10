const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const { createTestServer } = require('../../test/testServer');
const Pillar = require('../../models/Pillar');
const { createTestUser, createTestNiche } = require('../../test/helpers');
const llmService = require('../../services/llm');

// Mock the auth middleware
jest.mock('../middleware/auth', () => require('../__mocks__/auth'));

// Mock the LLM service
jest.mock('../../services/llm');

let mongoServer;
let testUser;
let testNiche;
let app;
let server;

beforeAll(async () => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user and niche using helpers
  testUser = await createTestUser();
  testNiche = await createTestNiche({}, testUser);

  // Initialize test server
  app = await createTestServer();
  server = app.listen(0);
});

afterAll(async () => {
  // Close server and database connections
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Pillar.deleteMany({});
  jest.clearAllMocks();
});

describe('Pillar Routes', () => {
  describe('POST /niches/:nicheId/pillars/generate', () => {
    it('should generate pillars using AI', async () => {
      llmService.sendLLMRequest.mockResolvedValue('1. First Pillar\n2. Second Pillar\n3. Third Pillar');

      const response = await request(app)
        .post(`/api/niches/${testNiche._id}/pillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(201);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0]).toHaveProperty('title', 'First Pillar');
      expect(response.body.data[0]).toHaveProperty('status', 'pending');
    });

    it('should handle AI generation errors', async () => {
      llmService.sendLLMRequest.mockRejectedValue(new Error('AI Service Error'));

      const response = await request(app)
        .post(`/api/niches/${testNiche._id}/pillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to generate pillars');
    });

    it('should handle invalid niche ID', async () => {
      const response = await request(app)
        .post('/api/niches/invalid-id/pillars/generate')
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid niche ID format');
    });

    it('should handle empty AI response', async () => {
      llmService.sendLLMRequest.mockResolvedValue('');

      const response = await request(app)
        .post(`/api/niches/${testNiche._id}/pillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'No pillars generated');
    });
  });

  describe('GET /niches/:nicheId/pillars', () => {
    beforeEach(async () => {
      // Create test pillars
      await Pillar.create([
        {
          title: 'Pillar 1',
          niche: testNiche._id,
          createdBy: testUser._id,
          status: 'pending',
          createdAt: new Date('2023-01-01')
        },
        {
          title: 'Pillar 2',
          niche: testNiche._id,
          createdBy: testUser._id,
          status: 'approved',
          createdAt: new Date('2023-01-02')
        },
        {
          title: 'Pillar 3',
          niche: testNiche._id,
          createdBy: testUser._id,
          status: 'pending',
          createdAt: new Date('2023-01-03')
        }
      ]);
    });

    it('should list all pillars for a niche', async () => {
      const response = await request(app)
        .get(`/api/niches/${testNiche._id}/pillars`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);
    });

    it('should sort pillars by creation date in descending order', async () => {
      const response = await request(app)
        .get(`/api/niches/${testNiche._id}/pillars`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Pillar 3');
      expect(response.body[2].title).toBe('Pillar 1');
    });

    it('should handle invalid niche ID', async () => {
      const response = await request(app)
        .get('/api/niches/invalid-id/pillars')
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid niche ID format');
    });

    it('should return empty array for non-existent niche', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/niches/${nonExistentId}/pillars`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /pillars/:id/approve', () => {
    it('should approve a pillar', async () => {
      const pillar = await Pillar.create({
        title: 'Test Pillar',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}/approve`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
    });

    it('should prevent unauthorized approval', async () => {
      const unauthorizedUser = await createTestUser({
        email: 'unauthorized1@example.com'
      });

      const pillar = await Pillar.create({
        title: 'Test Pillar',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}/approve`)
        .set('x-test-user-id', unauthorizedUser._id.toString());

      expect(response.status).toBe(403);
    });

    it('should handle approving an already approved pillar', async () => {
      const pillar = await Pillar.create({
        title: 'Test Pillar',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'approved'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}/approve`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Pillar is already approved');
    });

    it('should handle non-existent pillar', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/pillars/${nonExistentId}/approve`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Pillar not found');
    });
  });

  describe('PUT /pillars/:id', () => {
    it('should update pillar title', async () => {
      const pillar = await Pillar.create({
        title: 'Original Title',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should update pillar status', async () => {
      const pillar = await Pillar.create({
        title: 'Test Pillar',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({ status: 'in_progress' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });

    it('should update multiple fields', async () => {
      const pillar = await Pillar.create({
        title: 'Original Title',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({
          title: 'Updated Title',
          status: 'in_progress'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.status).toBe('in_progress');
    });

    it('should handle invalid fields', async () => {
      const pillar = await Pillar.create({
        title: 'Test Pillar',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/pillars/${pillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({ invalidField: 'value' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid fields in request');
    });
  });

  describe('DELETE /pillars/:id', () => {
    it('should delete a pillar', async () => {
      const pillar = await Pillar.create({
        title: 'To Be Deleted',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .delete(`/api/pillars/${pillar._id}`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(204);

      const deletedPillar = await Pillar.findById(pillar._id);
      expect(deletedPillar).toBeNull();
    });

    it('should handle non-existent pillar', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/pillars/${nonExistentId}`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Pillar not found');
    });

    it('should prevent unauthorized deletion', async () => {
      const unauthorizedUser = await createTestUser({
        email: 'unauthorized2@example.com'
      });

      const pillar = await Pillar.create({
        title: 'Test Pillar',
        niche: testNiche._id,
        createdBy: testUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .delete(`/api/pillars/${pillar._id}`)
        .set('x-test-user-id', unauthorizedUser._id.toString());

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Not authorized to delete this pillar');
    });
  });
});
