const mongoose = require('mongoose');
const request = require('supertest');
const { createTestServer } = require('../../test/testServer');
const Pillar = require('../../models/Pillar');
const Subpillar = require('../../models/Subpillar');
const { createTestUser, createTestNiche } = require('../../test/helpers');
const { sendLLMRequest } = require('../../services/llm');

// Mock the LLM service
jest.mock('../../services/llm');

// Test data constants
const TEST_PILLAR_TITLE = 'Test Content Pillar';
const TEST_SUBPILLAR_TITLE = 'Test Subpillar';
const VALID_STATUSES = ['draft', 'active', 'archived'];

// Test utilities
const createTestPillar = async (user, niche, status = 'approved') => {
  return await Pillar.create({
    title: TEST_PILLAR_TITLE,
    niche: niche._id,
    createdBy: user._id,
    status
  });
};

const createTestSubpillar = async (pillar, user, title = TEST_SUBPILLAR_TITLE) => {
  return await Subpillar.create({
    title,
    pillar: pillar._id,
    createdBy: user._id,
    status: 'draft'
  });
};

describe('Subpillar Routes', () => {
  let app;
  let server;
  let testUser;
  let testNiche;
  let testPillar;

  // Setup test environment
  beforeAll(async () => {
    app = await createTestServer();
    server = app.listen(0);
  });

  // Cleanup test environment
  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  // Reset database state and create fresh test data for each test
  beforeEach(async () => {
    await Pillar.deleteMany({});
    await Subpillar.deleteMany({});
    jest.clearAllMocks();

    // Create fresh test data for each test
    testUser = await createTestUser();
    testNiche = await createTestNiche({}, testUser);
    testPillar = await createTestPillar(testUser, testNiche);
  });

  describe('POST /pillars/:pillarId/subpillars/generate', () => {
    const AI_RESPONSE = '1. First Subpillar\n2. Second Subpillar\n3. Third Subpillar';

    beforeEach(() => {
      sendLLMRequest.mockResolvedValue(AI_RESPONSE);
    });

    it('should successfully generate subpillars using AI', async () => {
      const response = await request(app)
        .post(`/api/pillars/${testPillar._id}/subpillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      // Verify response structure
      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);

      // Verify generated subpillars
      response.body.forEach(subpillar => {
        expect(subpillar).toMatchObject({
          pillar: testPillar._id.toString(),
          createdBy: testUser._id.toString(),
          status: 'draft'
        });
      });

      // Verify AI service usage
      expect(sendLLMRequest).toHaveBeenCalledWith(
        'openai',
        'gpt-4',
        expect.stringContaining(TEST_PILLAR_TITLE)
      );

      // Verify database state
      const dbSubpillars = await Subpillar.find({ pillar: testPillar._id });
      expect(dbSubpillars).toHaveLength(3);
    });

    it('should prevent generating subpillars for non-approved pillars', async () => {
      const pendingPillar = await createTestPillar(testUser, testNiche, 'pending');

      const response = await request(app)
        .post(`/api/pillars/${pendingPillar._id}/subpillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Can only generate subpillars for approved pillars'
      });

      // Verify no subpillars were created
      const dbSubpillars = await Subpillar.find({ pillar: pendingPillar._id });
      expect(dbSubpillars).toHaveLength(0);
    });

    it('should handle AI service errors gracefully', async () => {
      sendLLMRequest.mockRejectedValue(new Error('AI Service Error'));

      const response = await request(app)
        .post(`/api/pillars/${testPillar._id}/subpillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: 'Failed to generate subpillars'
      });

      // Verify no subpillars were created
      const dbSubpillars = await Subpillar.find({ pillar: testPillar._id });
      expect(dbSubpillars).toHaveLength(0);
    });

    it('should handle invalid pillar IDs', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/pillars/${invalidId}/subpillars/generate`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Pillar not found'
      });
    });

    it('should prevent unauthorized users from generating subpillars', async () => {
      const unauthorizedUser = await createTestUser({ email: 'unauthorized@example.com' });

      const response = await request(app)
        .post(`/api/pillars/${testPillar._id}/subpillars/generate`)
        .set('x-test-user-id', unauthorizedUser._id.toString());

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: 'Not authorized to modify this pillar'
      });
    });
  });

  describe('GET /pillars/:pillarId/subpillars', () => {
    it('should list all subpillars for a pillar', async () => {
      // Create test subpillars with sequential timestamps
      const baseTimestamp = Date.now();
      const subpillars = await Promise.all([
        createTestSubpillar(testPillar, testUser, 'Subpillar 1').then(s => {
          s.createdAt = new Date(baseTimestamp);
          return s.save();
        }),
        createTestSubpillar(testPillar, testUser, 'Subpillar 2').then(s => {
          s.createdAt = new Date(baseTimestamp + 1);
          return s.save();
        }),
        createTestSubpillar(testPillar, testUser, 'Subpillar 3').then(s => {
          s.createdAt = new Date(baseTimestamp + 2);
          return s.save();
        })
      ]);

      const response = await request(app)
        .get(`/api/pillars/${testPillar._id}/subpillars`)
        .set('x-test-user-id', testUser._id.toString());

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);

      // Verify subpillar data
      response.body.forEach((subpillar, index) => {
        expect(subpillar).toMatchObject({
          title: `Subpillar ${index + 1}`,
          pillar: testPillar._id.toString(),
          createdBy: testUser._id.toString()
        });
      });
    });

    it('should return empty array for pillar with no subpillars', async () => {
      const response = await request(app)
        .get(`/api/pillars/${testPillar._id}/subpillars`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('should handle invalid pillar IDs', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/pillars/${invalidId}/subpillars`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Pillar not found'
      });
    });
  });

  describe('PUT /subpillars/:id', () => {
    let testSubpillar;

    beforeEach(async () => {
      testSubpillar = await createTestSubpillar(testPillar, testUser);
    });

    it('should update subpillar title and status', async () => {
      const updates = {
        title: 'Updated Title',
        status: 'active'
      };

      const response = await request(app)
        .put(`/api/pillars/subpillar/${testSubpillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send(updates);

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updates);

      // Verify database update
      const updatedSubpillar = await Subpillar.findById(testSubpillar._id);
      expect(updatedSubpillar.title).toBe(updates.title);
      expect(updatedSubpillar.status).toBe(updates.status);
    });

    it('should prevent unauthorized updates', async () => {
      const unauthorizedUser = await createTestUser({
        email: 'unauthorized@example.com'
      });

      const response = await request(app)
        .put(`/api/pillars/subpillar/${testSubpillar._id}`)
        .set('x-test-user-id', unauthorizedUser._id.toString())
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: 'Not authorized to modify this subpillar'
      });

      // Verify no changes were made
      const unchangedSubpillar = await Subpillar.findById(testSubpillar._id);
      expect(unchangedSubpillar.title).toBe(TEST_SUBPILLAR_TITLE);
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .put(`/api/pillars/subpillar/${testSubpillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Invalid status value'
      });

      // Verify no changes were made
      const unchangedSubpillar = await Subpillar.findById(testSubpillar._id);
      expect(unchangedSubpillar.status).toBe('draft');
    });

    it('should handle partial updates', async () => {
      const response = await request(app)
        .put(`/api/pillars/subpillar/${testSubpillar._id}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({ title: 'Only Title Update' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Only Title Update');
      expect(response.body.status).toBe('draft');
    });

    it('should handle non-existent subpillars', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/pillars/subpillar/${nonExistentId}`)
        .set('x-test-user-id', testUser._id.toString())
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Subpillar not found'
      });
    });
  });

  describe('DELETE /subpillars/:id', () => {
    let testSubpillar;

    beforeEach(async () => {
      testSubpillar = await createTestSubpillar(testPillar, testUser);
    });

    it('should successfully delete a subpillar', async () => {
      const response = await request(app)
        .delete(`/api/pillars/subpillar/${testSubpillar._id}`)
        .set('x-test-user-id', testUser._id.toString());

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Subpillar deleted successfully'
      });

      // Verify deletion
      const deletedSubpillar = await Subpillar.findById(testSubpillar._id);
      expect(deletedSubpillar).toBeNull();
    });

    it('should prevent unauthorized deletion', async () => {
      const unauthorizedUser = await createTestUser({
        email: 'unauthorized@example.com'
      });

      const response = await request(app)
        .delete(`/api/pillars/subpillar/${testSubpillar._id}`)
        .set('x-test-user-id', unauthorizedUser._id.toString());

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        error: 'Not authorized to delete this subpillar'
      });

      // Verify subpillar still exists
      const existingSubpillar = await Subpillar.findById(testSubpillar._id);
      expect(existingSubpillar).toBeTruthy();
    });

    it('should handle non-existent subpillars', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/pillars/subpillar/${nonExistentId}`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Subpillar not found'
      });
    });

    it('should handle invalid subpillar IDs', async () => {
      const response = await request(app)
        .delete('/api/pillars/subpillar/invalid-id')
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(404);
    });
  });
});
