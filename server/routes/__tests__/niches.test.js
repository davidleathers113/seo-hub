const request = require('supertest');
const NicheService = require('../../services/niche');
const { createTestUser, generateTestToken } = require('../../test/helpers');

// Mock Redis
jest.mock('redis', () => require('../../test/mocks/redisMock'));
const { mockRedisClient } = require('../../test/mocks/redisMock');

// Mock NicheService
jest.mock('../../services/niche');

describe('Niche Routes', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(async () => {
    const { createTestServer } = require('../../test/testServer');
    app = await createTestServer();
    
    // Create a test user with both id and _id
    const userId = '123';
    testUser = {
      _id: userId,
      id: userId, // Add id field to match what routes expect
      email: 'test@example.com'
    };
    authToken = generateTestToken(testUser);

    // Mock Redis to not blacklist the token
    mockRedisClient.get.mockResolvedValue(null);
  }, 30000); // Increased timeout to 30 seconds

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.get.mockReset();
    mockRedisClient.set.mockReset();
    mockRedisClient.get.mockResolvedValue(null); // Not blacklisted
  });

  describe('GET /niches', () => {
    it('should return all niches for authenticated user', async () => {
      const mockNiches = [
        { _id: '1', name: 'Niche 1', userId: testUser.id },
        { _id: '2', name: 'Niche 2', userId: testUser.id }
      ];

      NicheService.list.mockResolvedValue(mockNiches);

      const response = await request(app)
        .get('/niches')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockNiches);
      expect(NicheService.list).toHaveBeenCalledWith(testUser.id);
    });

    it('should return error for unauthenticated request', async () => {
      const response = await request(app)
        .get('/niches');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('POST /niches', () => {
    it('should create a new niche for authenticated user', async () => {
      const mockNiche = {
        _id: '1',
        name: 'New Niche',
        userId: testUser.id
      };

      NicheService.create.mockResolvedValue(mockNiche);

      const response = await request(app)
        .post('/niches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Niche' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockNiche);
      expect(NicheService.create).toHaveBeenCalledWith(testUser.id, 'New Niche');
    });

    it('should return error when name is not provided', async () => {
      const response = await request(app)
        .post('/niches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Niche name is required');
    });
  });

  describe('GET /niches/:id', () => {
    it('should return specific niche for authenticated user', async () => {
      const mockNiche = {
        _id: '1',
        name: 'Test Niche',
        userId: testUser.id
      };

      NicheService.getById.mockResolvedValue(mockNiche);

      const response = await request(app)
        .get('/niches/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockNiche);
      expect(NicheService.getById).toHaveBeenCalledWith('1', testUser.id);
    });

    it('should return 404 for non-existent niche', async () => {
      NicheService.getById.mockResolvedValue(null);

      const response = await request(app)
        .get('/niches/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Niche not found or not owned by the user');
    });
  });

  describe('PUT /niches/:id', () => {
    it('should update niche for authenticated user', async () => {
      const mockUpdatedNiche = {
        _id: '1',
        name: 'Updated Niche',
        userId: testUser.id
      };

      NicheService.update.mockResolvedValue(mockUpdatedNiche);

      const response = await request(app)
        .put('/niches/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Niche' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedNiche);
      expect(NicheService.update).toHaveBeenCalledWith('1', testUser.id, { name: 'Updated Niche' });
    });

    it('should return error when name is not provided', async () => {
      const response = await request(app)
        .put('/niches/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Niche name is required');
    });

    it('should return 404 for non-existent niche', async () => {
      NicheService.update.mockResolvedValue(null);

      const response = await request(app)
        .put('/niches/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Niche' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Niche not found or not owned by the user');
    });
  });

  describe('DELETE /niches/:id', () => {
    it('should delete niche for authenticated user', async () => {
      NicheService.delete.mockResolvedValue({ _id: '1' });

      const response = await request(app)
        .delete('/niches/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Niche deleted successfully');
      expect(NicheService.delete).toHaveBeenCalledWith('1', testUser.id);
    });

    it('should return 404 for non-existent niche', async () => {
      NicheService.delete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/niches/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Niche not found or not owned by the user');
    });
  });

  describe('POST /niches/:nicheId/pillars/generate', () => {
    it('should generate pillars for a niche', async () => {
      const mockPillars = [
        { _id: '1', title: 'Pillar 1' },
        { _id: '2', title: 'Pillar 2' }
      ];

      NicheService.generatePillars.mockResolvedValue(mockPillars);

      const response = await request(app)
        .post('/niches/1/pillars/generate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockPillars);
      expect(NicheService.generatePillars).toHaveBeenCalledWith('1', testUser.id);
    });

    it('should handle errors during pillar generation', async () => {
      NicheService.generatePillars.mockRejectedValue(new Error('Generation failed'));

      const response = await request(app)
        .post('/niches/1/pillars/generate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to generate pillars');
    });
  });
});
