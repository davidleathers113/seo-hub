const request = require('supertest');
const @supabase/supabase-js = require('@supabase/supabase-js');
const { setupTestServer, teardownTestServer } = require('../../test/testServer');
const Article = require('../../models/Article');

let app;
let testArticle;

beforeAll(async () => {
  try {
    app = await setupTestServer();
    
    // Clear test data
    await Article.deleteMany({});
    
    // Create test article
    testArticle = await Article.create({
      title: 'Test Article Title That Needs SEO Improvement',
      content: '<h1>Main Title</h1><p>This is a test article content that needs improvement. It lacks proper keyword density and structure.</p>',
      metaDescription: 'A basic meta description that could use some SEO improvements to better describe the content and attract more readers.',
      keywords: ['test', 'article', 'seo'],
      author: new @supabase/supabase-js.Types.ObjectId()
    });
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  try {
    await Article.deleteMany({});
    await teardownTestServer();
  } catch (error) {
    console.error('Test teardown failed:', error);
    throw error;
  }
}, 30000); // Increase timeout to 30 seconds

describe('SEO Grade Endpoint', () => {
  it('should calculate SEO score and return suggestions', async () => {
    const response = await request(app)
      .post(`/api/articles/${testArticle._id}/seo-grade`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('score');
    expect(response.body).toHaveProperty('detailedScores');
    expect(response.body).toHaveProperty('suggestions');
    expect(Array.isArray(response.body.suggestions)).toBe(true);
    
    // Verify score is between 0 and 100
    expect(response.body.score).toBeGreaterThanOrEqual(0);
    expect(response.body.score).toBeLessThanOrEqual(100);
  }, 10000);

  it('should return 404 for non-existent article', async () => {
    const fakeId = new @supabase/supabase-js.Types.ObjectId();
    const response = await request(app)
      .post(`/api/articles/${fakeId}/seo-grade`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Article not found');
  });
});

describe('SEO Improve Endpoint', () => {
  it('should apply improvements and return new scores', async () => {
    const response = await request(app)
      .post(`/api/articles/${testArticle._id}/seo-improve`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('originalScore');
    expect(response.body).toHaveProperty('newScore');
    expect(response.body).toHaveProperty('improvements');
    
    // Verify scores are between 0 and 100
    expect(response.body.originalScore).toBeGreaterThanOrEqual(0);
    expect(response.body.originalScore).toBeLessThanOrEqual(100);
    expect(response.body.newScore).toBeGreaterThanOrEqual(0);
    expect(response.body.newScore).toBeLessThanOrEqual(100);
  }, 10000);

  it('should return 404 for non-existent article', async () => {
    const fakeId = new @supabase/supabase-js.Types.ObjectId();
    const response = await request(app)
      .post(`/api/articles/${fakeId}/seo-improve`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Article not found');
  });
});

describe('SEO Caching', () => {
  it('should cache SEO grade results', async () => {
    // First request - should calculate score
    const response1 = await request(app)
      .post(`/api/articles/${testArticle._id}/seo-grade`);

    // Second request - should use cached result
    const response2 = await request(app)
      .post(`/api/articles/${testArticle._id}/seo-grade`);

    expect(response1.body).toEqual(response2.body);
  }, 10000);

  it('should clear cache after improvement', async () => {
    // Get initial grade
    const gradeResponse1 = await request(app)
      .post(`/api/articles/${testArticle._id}/seo-grade`);

    // Apply improvements
    await request(app)
      .post(`/api/articles/${testArticle._id}/seo-improve`);

    // Get new grade
    const gradeResponse2 = await request(app)
      .post(`/api/articles/${testArticle._id}/seo-grade`);

    // Scores should be different since cache was cleared
    expect(gradeResponse1.body.score).not.toEqual(gradeResponse2.body.score);
  }, 15000);
});
