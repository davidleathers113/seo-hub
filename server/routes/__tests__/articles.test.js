const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestServer, teardownTestServer } = require('../../test/testServer');
const { createTestUser, generateTestToken } = require('../../test/helpers');
const Article = require('../../models/Article');
const User = require('../../models/User');
const fs = require('fs').promises;
const path = require('path');

let app;
let testUser;
let authToken;

beforeAll(async () => {
  app = await setupTestServer();
});

afterAll(async () => {
  await teardownTestServer();
});

beforeEach(async () => {
  // Clean up both collections before each test
  await Promise.all([
    Article.deleteMany({}),
    User.deleteMany({})
  ]);
  
  // Create a fresh test user for each test
  testUser = await createTestUser();
  authToken = generateTestToken(testUser);
});

describe('Articles API', () => {
  describe('GET /api/articles', () => {
    it('should return all articles for authenticated user', async () => {
      // Create test articles
      const articles = [
        {
          title: 'Test Article 2',
          content: 'Content 2',
          metaDescription: 'Meta 2',
          author: testUser._id,
          keywords: ['test2', 'article2']
        },
        {
          title: 'Test Article 1',
          content: 'Content 1',
          metaDescription: 'Meta 1',
          author: testUser._id,
          keywords: ['test1', 'article1']
        }
      ];

      await Article.insertMany(articles);

      const response = await request(app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', 'Test Article 2');
      expect(response.body[1]).toHaveProperty('title', 'Test Article 1');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/articles');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return a single article', async () => {
      const article = await Article.create({
        title: 'Test Article',
        content: 'Test Content',
        metaDescription: 'Test Meta',
        author: testUser._id,
        keywords: ['test']
      });

      const response = await request(app)
        .get(`/api/articles/${article._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Test Article');
      expect(response.body).toHaveProperty('content', 'Test Content');
    });

    it('should return 404 for non-existent article', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/articles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/articles/:id/export', () => {
    it('should export article as txt', async () => {
      const article = await Article.create({
        title: 'Export Test',
        content: 'Export Content',
        metaDescription: 'Export Meta',
        author: testUser._id
      });

      const response = await request(app)
        .post(`/api/articles/${article._id}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'txt' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/plain/);
      expect(response.headers['content-disposition']).toMatch(/Export Test\.txt/);
    });

    it('should export article as html', async () => {
      const article = await Article.create({
        title: 'Export Test',
        content: 'Export Content',
        metaDescription: 'Export Meta',
        author: testUser._id
      });

      const response = await request(app)
        .post(`/api/articles/${article._id}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'html' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.headers['content-disposition']).toMatch(/Export Test\.html/);
    });

    it('should export article as docx', async () => {
      const article = await Article.create({
        title: 'Export Test',
        content: 'Export Content',
        metaDescription: 'Export Meta',
        author: testUser._id
      });

      const response = await request(app)
        .post(`/api/articles/${article._id}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'docx' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/);
      expect(response.headers['content-disposition']).toMatch(/Export Test\.docx/);
    });

    it('should return 400 for invalid format', async () => {
      const article = await Article.create({
        title: 'Export Test',
        content: 'Export Content',
        metaDescription: 'Export Meta',
        author: testUser._id
      });

      const response = await request(app)
        .post(`/api/articles/${article._id}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete an article', async () => {
      const article = await Article.create({
        title: 'Delete Test',
        content: 'Delete Content',
        metaDescription: 'Delete Meta',
        author: testUser._id
      });

      const response = await request(app)
        .delete(`/api/articles/${article._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Article deleted successfully');

      const deletedArticle = await Article.findById(article._id);
      expect(deletedArticle).toBeNull();
    });

    it('should return 404 for non-existent article', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/articles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should not allow deletion of articles owned by other users', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const article = await Article.create({
        title: 'Other User Article',
        content: 'Content',
        metaDescription: 'Meta',
        author: otherUser._id
      });

      const response = await request(app)
        .delete(`/api/articles/${article._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      
      const articleStillExists = await Article.findById(article._id);
      expect(articleStillExists).toBeTruthy();
    });
  });
});
