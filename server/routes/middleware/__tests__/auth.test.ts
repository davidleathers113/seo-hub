import { TestContainer } from '../../../test/infrastructure/test-container';
import { TestMonitor } from '../../../test/infrastructure/test-monitor';
import { TokenError, AuthError, RedisError } from '../../../test/infrastructure/errors';
import { authenticateWithToken, requireUser, initRedis } from '../auth';
import { generateToken } from '../../../utils/jwt';
import UserService from '../../../services/user';
import { Request, Response } from 'express';

const container = TestContainer.getInstance();
const monitoredTest = TestMonitor.createTestWrapper();

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(async () => {
    // Reset test state
    await container.reset();

    // Setup request/response mocks
    req = {
      headers: {},
      get: jest.fn((name: string) => {
        if (name.toLowerCase() === 'set-cookie') {
          return undefined;
        }
        return req.headers?.[name.toLowerCase()];
      }) as any,
    };

    res = {
      status: jest.fn(() => res) as any,
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe('authenticateWithToken', () => {
    monitoredTest('should authenticate successfully with valid token', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com'
      };
      const token = generateToken(mockUser);

      req.headers = { authorization: `Bearer ${token}` };

      const redisMock = container.getRedisMock();
      await redisMock.connect();

      jest.spyOn(UserService, 'get').mockResolvedValue(mockUser);

      // Act
      await authenticateWithToken(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);

      // Verify monitoring
      const events = TestMonitor.getTestEvents('should authenticate successfully with valid token');
      expect(events).toContainEqual({
        type: 'auth_success',
        data: {
          userId: mockUser._id,
          email: mockUser.email
        },
        timestamp: expect.any(Date),
        context: expect.any(Object)
      });
    });

    monitoredTest('should handle missing authorization header', async () => {
      // Act
      await authenticateWithToken(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.any(String),
        code: 'VALIDATION_ERROR'
      });

      // Verify monitoring
      const events = TestMonitor.getTestEvents('should handle missing authorization header');
      expect(events).toContainEqual({
        type: 'auth_error',
        data: {
          type: 'ValidationError'
        },
        timestamp: expect.any(Date),
        context: expect.any(Object)
      });
    });

    monitoredTest('should handle blacklisted token', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com'
      };
      const token = generateToken(mockUser);

      req.headers = { authorization: `Bearer ${token}` };

      const redisMock = container.getRedisMock();
      await redisMock.connect();
      await redisMock.set(`bl_${token}`, 'true');

      // Act
      await authenticateWithToken(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.any(String),
        code: 'TOKEN_ERROR'
      });

      // Verify Redis operations
      const operations = redisMock.getOperationHistory();
      expect(operations).toContainEqual({
        type: 'get',
        key: `bl_${token}`,
        timestamp: expect.any(Date)
      });
    });

    monitoredTest('should handle Redis connection failure', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com'
      };
      const token = generateToken(mockUser);

      req.headers = { authorization: `Bearer ${token}` };

      const redisMock = container.getRedisMock();
      redisMock.simulateError(new Error('Connection failed'));

      // Act
      await authenticateWithToken(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Service temporarily unavailable',
        code: 'REDIS_ERROR'
      });

      // Verify monitoring
      const events = TestMonitor.getTestEvents('should handle Redis connection failure');
      expect(events).toContainEqual({
        type: 'redis_error',
        data: expect.any(Object),
        timestamp: expect.any(Date),
        context: expect.any(Object)
      });
    });

    monitoredTest('should handle non-existent user', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com'
      };
      const token = generateToken(mockUser);

      req.headers = { authorization: `Bearer ${token}` };

      const redisMock = container.getRedisMock();
      await redisMock.connect();

      jest.spyOn(UserService, 'get').mockResolvedValue(null);

      // Act
      await authenticateWithToken(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    });
  });

  describe('requireUser', () => {
    monitoredTest('should allow request with authenticated user', async () => {
      // Arrange
      (req as any).user = {
        _id: '123',
        email: 'test@example.com'
      };

      // Act
      await requireUser(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    monitoredTest('should reject request without user', async () => {
      // Act
      await requireUser(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        code: 'USER_REQUIRED'
      });
    });
  });
});