import { TestContainer } from '../../../test/infrastructure/test-container';
import { TestMonitor, monitoredTest } from '../../../test/infrastructure/test-monitor';
import { TokenError, RedisError, AuthError } from '../../../test/infrastructure/errors';
import { EnhancedRedisMock } from '../../../test/infrastructure/enhanced-redis-mock';
import { authenticateWithToken, requireUser, initRedis } from '../auth';
import { generateToken } from '../../../utils/jwt';
import UserService from '../../../services/user';
import type { Request, Response } from '../../../test/infrastructure/test-types';

// Mock dependencies
jest.mock('../../../utils/jwt');
jest.mock('../../../services/user');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let redisMock: EnhancedRedisMock;

  beforeEach(async () => {
    // Reset test state
    TestMonitor.clear();

    // Create fresh Redis mock
    redisMock = new EnhancedRedisMock();

    // Setup request/response mocks
    req = {
      headers: {},
      get: jest.fn((name: string) => {
        if (name.toLowerCase() === 'set-cookie') {
          return undefined;
        }
        return req.headers?.[name.toLowerCase()];
      })
    } as Partial<Request>;

    res = {
      status: jest.fn(() => res) as any,
      json: jest.fn(),
    };

    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Initialize Redis client with mock
    await initRedis(redisMock as any);
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

      // Mock token verification
      jest.spyOn(require('../../../utils/jwt'), 'verifyToken')
        .mockReturnValue({ id: mockUser._id });

      // Mock user service
      jest.spyOn(UserService, 'get').mockResolvedValue(mockUser);

      // Set up Redis mock
      await redisMock.connect();

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
        error: 'Missing required field: headers.authorization',
        field: 'headers.authorization',
        code: 'VALIDATION_ERROR'
      });

      // Verify monitoring
      const events = TestMonitor.getTestEvents('should handle missing authorization header');
      expect(events).toContainEqual({
        type: 'auth_error',
        data: {
          type: 'ValidationError',
          message: 'Missing required field: headers.authorization'
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

      // Mock token verification
      jest.spyOn(require('../../../utils/jwt'), 'verifyToken')
        .mockReturnValue({ id: mockUser._id });

      // Set up Redis mock with blacklisted token
      await redisMock.connect();
      await redisMock.set(`bl_${token}`, 'true');

      // Act
      await authenticateWithToken(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token has been invalidated',
        code: 'TOKEN_ERROR'
      });

      // Verify monitoring
      const events = TestMonitor.getTestEvents('should handle blacklisted token');
      expect(events).toContainEqual({
        type: 'auth_error',
        data: {
          type: 'TokenError',
          message: 'Token has been invalidated'
        },
        timestamp: expect.any(Date),
        context: expect.any(Object)
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

      // Mock token verification
      jest.spyOn(require('../../../utils/jwt'), 'verifyToken')
        .mockReturnValue({ id: mockUser._id });

      // Set up Redis mock and simulate error
      const error = new RedisError('Connection failed', 'connection');
      await redisMock.simulateError(error);

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
        type: 'auth_error',
        data: {
          type: 'RedisError',
          message: 'Connection failed',
          operation: 'connection'
        },
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

      // Set up Redis mock
      await redisMock.connect();

      // Mock token verification
      jest.spyOn(require('../../../utils/jwt'), 'verifyToken')
        .mockReturnValue({ id: mockUser._id });

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
