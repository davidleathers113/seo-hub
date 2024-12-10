const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../test/testServer');
const Outline = require('../../models/Outline');
const Subpillar = require('../../models/Subpillar');
const Research = require('../../models/Research');
const { createTestUser, createTestNiche } = require('../../test/helpers');
const { generateOutline, generateContentPoints, mergeContentIntoArticle } = require('../../services/llm');

// Mock the auth middleware
jest.mock('../middleware/auth', () => ({
  authenticateWithToken: (req, res, next) => {
    if (req.headers['x-test-user-id']) {
      req.user = { _id: req.headers['x-test-user-id'] };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}));

// Mock the LLM service
jest.mock('../../services/llm', () => ({
  generateOutline: jest.fn(),
  generateContentPoints: jest.fn(),
  mergeContentIntoArticle: jest.fn()
}));

// Mock the logger
jest.mock('../../utils/log', () => ({
  logger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  })
}));

let mongoServer;
let testUser;
let testNiche;
let testPillar;
let testSubpillar;
let testResearch;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  testUser = await createTestUser();
  testNiche = await createTestNiche({}, testUser);
  testPillar = await mongoose.model('Pillar').create({
    title: 'Test Pillar',
    niche: testNiche._id,
    createdBy: testUser._id,
    status: 'approved'
  });

  testSubpillar = await Subpillar.create({
    title: 'Test Subpillar',
    pillar: testPillar._id,
    createdBy: testUser._id,
    status: 'active'
  });

  testResearch = await Research.create({
    content: 'Test research content',
    source: 'Test source',
    subpillar: testSubpillar._id,
    createdBy: testUser._id
  });

  server = app.listen(0);
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Outline.deleteMany({});
  jest.clearAllMocks();
});

describe('Outline Routes', () => {
  describe('POST /subpillars/:subpillarId/outline', () => {
    it('should generate an outline from research', async () => {
      const mockSections = [
        { title: 'Section 1', contentPoints: [], order: 0 },
        { title: 'Section 2', contentPoints: [], order: 1 }
      ];

      generateOutline.mockResolvedValue(mockSections);

      const response = await request(app)
        .post(`/api/subpillars/${testSubpillar._id}/outline`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('sections');
      expect(response.body.data.sections).toHaveLength(2);
      expect(response.body.data.subpillar).toBe(testSubpillar._id.toString());
    });

    it('should handle missing research', async () => {
      await Research.deleteMany({ subpillar: testSubpillar._id });

      const response = await request(app)
        .post(`/api/subpillars/${testSubpillar._id}/outline`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'No research found for this subpillar');
    });
  });

  describe('POST /outline/:outlineId/content', () => {
    it('should generate content points for outline sections', async () => {
      // Create research for the subpillar
      await Research.create({
        content: 'Test research content',
        source: 'Test source',
        subpillar: testSubpillar._id,
        createdBy: testUser._id
      });

      const outline = await Outline.create({
        subpillar: testSubpillar._id,
        sections: [
          { title: 'Section 1', contentPoints: [], order: 0 },
          { title: 'Section 2', contentPoints: [], order: 1 }
        ],
        createdBy: testUser._id
      });

      const mockContentPoints = [
        { point: 'Point 1', generated: true },
        { point: 'Point 2', generated: true }
      ];

      generateContentPoints.mockResolvedValue(mockContentPoints);

      const response = await request(app)
        .post(`/api/outline/${outline._id}/content`)
        .set('x-test-user-id', testUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body.data.sections[0].contentPoints).toHaveLength(2);
      expect(response.body.data.status).toBe('in_progress');
    });
  });

  describe('POST /articles/merge', () => {
    it('should merge content points into a draft article', async () => {
      const outline = await Outline.create({
        subpillar: testSubpillar._id,
        sections: [
          {
            title: 'Section 1',
            contentPoints: [
              { point: 'Point 1', generated: true },
              { point: 'Point 2', generated: true }
            ],
            order: 0
          }
        ],
        createdBy: testUser._id
      });

      const mockArticle = 'Generated article content';
      mergeContentIntoArticle.mockResolvedValue(mockArticle);

      const response = await request(app)
        .post('/api/articles/merge')
        .set('x-test-user-id', testUser._id.toString())
        .send({ outlineId: outline._id });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('content', mockArticle);
      expect(response.body.data.outline.status).toBe('completed');
    });

    it('should require content points before merging', async () => {
      const outline = await Outline.create({
        subpillar: testSubpillar._id,
        sections: [
          { title: 'Section 1', contentPoints: [], order: 0 }
        ],
        createdBy: testUser._id
      });

      const response = await request(app)
        .post('/api/articles/merge')
        .set('x-test-user-id', testUser._id.toString())
        .send({ outlineId: outline._id });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Outline sections must have content points before merging');
    });
  });
});
