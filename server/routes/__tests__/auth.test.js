const request = require('supertest');
const UserService = require('../../services/user');
const { generateToken } = require('../../utils/jwt');

// Mock Redis before requiring any other modules
jest.mock('redis', () => require('../../test/mocks/redisMock'));

// Get the Redis mock client after mocking
const { mockRedisClient } = require('../../test/mocks/redisMock');

// Mock UserService
jest.mock('../../services/user');

describe('Auth Routes', () => {
  let app;

  beforeAll(async () => {
    // Create test server
    const { createTestServer } = require('../../test/testServer');
    app = await createTestServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Redis mock state
    mockRedisClient.get.mockReset();
    mockRedisClient.set.mockReset();
  });

  describe('POST /auth/login', () => {
    it('should return token and user data on successful login', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      UserService.authenticateWithPassword.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return error for invalid credentials', async () => {
      UserService.authenticateWithPassword.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('POST /auth/register', () => {
    it('should create user and return token on successful registration', async () => {
      const mockUser = {
        _id: '123',
        email: 'newuser@example.com'
      };

      UserService.createUser.mockResolvedValue({
        user: mockUser,
        token: 'mock-token'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return error for invalid registration data', async () => {
      UserService.createUser.mockRejectedValue(new Error('Invalid data'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully logout and blacklist token', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com'
      };
      const token = generateToken(mockUser);
      UserService.get.mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalled();
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user data for authenticated request', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com'
      };
      const token = generateToken(mockUser);
      UserService.get.mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return error for unauthenticated request', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });
});
