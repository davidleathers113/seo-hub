const mongoose = require('mongoose');
const request = require('supertest');
const { createTestServer } = require('../../test/testServer');
const UserService = require('../../services/user');
const { generateToken } = require('../../utils/jwt');
const Article = require('../../models/Article');

// Mock UserService
jest.mock('../../services/user');

const testUserId = new mongoose.Types.ObjectId().toString();
const testUser = {
  _id: testUserId,
  email: 'test@example.com',
  role: 'user'
};

// Generate a valid JWT token for testing
const testToken = generateToken(testUser);

describe('Articles API', () => {
  let testServer;

  beforeAll(async () => {
    try {
      // Mock UserService.get with proper implementation
      UserService.get.mockImplementation(async (id) => {
        if (id === testUserId) {
          return testUser;
        }
        return null;
      });

      // Create test server
      testServer = await createTestServer();
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (testServer) {
      await testServer.close();
    }
  });

  beforeEach(async () => {
    try {
      // Clear collections with proper error handling
      await Promise.all([
        Article.deleteMany({}),
        mongoose.connection.collection('users').deleteMany({})
      ]);

      // Reset mocks
      jest.clearAllMocks();
      UserService.get.mockImplementation(async (id) => {
        if (id === testUserId) {
          return testUser;
        }
        return null;
      });
    } catch (error) {
      console.error('Test reset failed:', error);
      throw error;
    }
  });

  describe('GET /api/articles', () => {
    it('should return all articles', async () => {
      // Arrange
      const mockArticles = [
        {
          title: 'Article 1',
          content: 'Content 1',
          metaDescription: 'Meta 1',
          author: testUserId
        },
        {
          title: 'Article 2',
          content: 'Content 2',
          metaDescription: 'Meta 2',
          author: testUserId
        }
      ];

      await Article.create(mockArticles);

      // Act
      const response = await request(testServer.app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${testToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Article 2');
      expect(response.body[1].title).toBe('Article 1');
    });

    it('should handle empty articles list', async () => {
      // Act
      const response = await request(testServer.app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${testToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return a single article', async () => {
      // Arrange
      const mockArticle = {
        title: 'Test Article',
        content: 'Test Content',
        metaDescription: 'Test Meta',
        author: testUserId
      };
      const article = await Article.create(mockArticle);

      // Act
      const response = await request(testServer.app)
        .get(`/api/articles/${article._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Article');
      expect(response.body.content).toBe('Test Content');
    });

    it('should handle non-existent article', async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId();

      // Act
      const response = await request(testServer.app)
        .get(`/api/articles/${nonExistentId}`)
        .set('Authorization', `Bearer ${testToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Article not found');
    });
  });
});
