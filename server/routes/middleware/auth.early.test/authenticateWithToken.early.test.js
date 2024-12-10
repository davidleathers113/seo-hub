
// Unit tests for: authenticateWithToken




const { authenticateWithToken, initRedis } = require('../auth');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../../utils/jwt');
const UserService = require('../../../services/user');
const redis = require('redis');
jest.mock("jsonwebtoken");
jest.mock("../../../services/user");
jest.mock("redis");

describe('authenticateWithToken() authenticateWithToken method', () => {
  let req, res, next, redisClientMock;

  beforeEach(() => {
    req = {
      get: jest.fn(),
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();

    redisClientMock = {
      get: jest.fn(),
      isReady: true,
    };

    redis.createClient.mockReturnValue(redisClientMock);
    initRedis(redisClientMock);
  });

  describe('Happy paths', () => {
    it('should authenticate successfully with a valid token', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 'userId', email: 'user@example.com' };
      const user = { id: 'userId', email: 'user@example.com' };

      req.get.mockReturnValue(`Bearer ${token}`);
      redisClientMock.get.mockResolvedValue(null);
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, decodedToken));
      UserService.get.mockResolvedValue(user);

      // Act
      await authenticateWithToken(req, res, next);

      // Assert
      expect(req.get).toHaveBeenCalledWith('Authorization');
      expect(redisClientMock.get).toHaveBeenCalledWith(`bl_${token}`);
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, expect.any(Function));
      expect(UserService.get).toHaveBeenCalledWith(decodedToken.id);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should return 401 if Authorization header is missing', async () => {
      // Arrange
      req.get.mockReturnValue(null);

      // Act
      await authenticateWithToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 401 if token is blacklisted', async () => {
      // Arrange
      const token = 'blacklistedToken';
      req.get.mockReturnValue(`Bearer ${token}`);
      redisClientMock.get.mockResolvedValue('blacklisted');

      // Act
      await authenticateWithToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token has been invalidated' });
    });

    it('should return 403 if token verification fails', async () => {
      // Arrange
      const token = 'invalidToken';
      req.get.mockReturnValue(`Bearer ${token}`);
      redisClientMock.get.mockResolvedValue(null);
      jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('Invalid token')));

      // Act
      await authenticateWithToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token verification failed' });
    });

    it('should return 401 if user is not found', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 'userId', email: 'user@example.com' };

      req.get.mockReturnValue(`Bearer ${token}`);
      redisClientMock.get.mockResolvedValue(null);
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, decodedToken));
      UserService.get.mockResolvedValue(null);

      // Act
      await authenticateWithToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 401 if Redis client is not ready', async () => {
      // Arrange
      redisClientMock.isReady = false;
      const token = 'validToken';
      req.get.mockReturnValue(`Bearer ${token}`);

      // Act
      await authenticateWithToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
  });
});

// End of unit tests for: authenticateWithToken
