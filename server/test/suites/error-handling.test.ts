import { TestContainer } from '../infrastructure/test-container';
import { TestContext, Request, Response } from '../infrastructure/test-types';
import { TestMonitor } from '../infrastructure/test-monitor';
import { AuthError, TokenError, SessionError, RedisError, ValidationError } from '../infrastructure/errors';
import { generateToken } from '../../utils/jwt';
import { authenticateWithToken } from '../../routes/middleware/auth';
import { createTokenError, createSessionError, createRedisError } from '../infrastructure/errors';

const container = TestContainer.getInstance();
const monitoredTest = TestMonitor.createTestWrapper();

describe('Error Handling', () => {
  let context: TestContext;
  let mockUser: {
    _id: string;
    email: string;
  };

  beforeEach(() => {
    mockUser = {
      _id: '123',
      email: 'test@example.com'
    };

    // Create properly typed request and response objects with headers
    const headers: Record<string, string | undefined> = {};
    const req = {
      headers,
      get: jest.fn((name: string) => headers[name.toLowerCase()]),
    } as unknown as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Partial<Response>;

    context = {
      req,
      res,
      next: jest.fn()
    };
  });

  describe('Error Classes', () => {
    monitoredTest('should properly extend Error class', async () => {
      // Arrange & Act
      const authError = new AuthError('Auth failed', 'AUTH_ERROR');
      const tokenError = new TokenError('Invalid token');
      const sessionError = new SessionError('Session expired');
      const redisError = new RedisError('Connection failed', 'connect');
      const validationError = new ValidationError('Invalid input', 'email');

      // Assert
      expect(authError).toBeInstanceOf(Error);
      expect(tokenError).toBeInstanceOf(AuthError);
      expect(sessionError).toBeInstanceOf(AuthError);
      expect(redisError).toBeInstanceOf(Error);
      expect(validationError).toBeInstanceOf(Error);

      // Verify error properties
      expect(authError).toMatchObject({
        name: 'AuthError',
        code: 'AUTH_ERROR',
        message: 'Auth failed'
      });

      expect(validationError).toMatchObject({
        name: 'ValidationError',
        field: 'email',
        message: 'Invalid input'
      });
    });

    monitoredTest('should create errors with factory methods', async () => {
      // Act
      const tokenError = createTokenError('Token invalid', 'abc123');
      const sessionError = createSessionError('Session expired', 'session123');
      const redisError = createRedisError('get', 'key123', 'Redis operation failed');

      // Assert
      expect(tokenError).toBeInstanceOf(TokenError);
      expect(tokenError.details).toMatchObject({ token: 'abc123' });

      expect(sessionError).toBeInstanceOf(SessionError);
      expect(sessionError.details).toMatchObject({ sessionId: 'session123' });

      expect(redisError).toBeInstanceOf(RedisError);
      expect(redisError.operation).toBe('get');
      expect(redisError.key).toBe('key123');
    });
  });

  describe('Authentication Errors', () => {
    monitoredTest('should handle missing authorization header', async () => {
      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      expect(context.res.status).toHaveBeenCalledWith(401);
      expect(context.res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/authentication required/i),
        code: 'AUTH_ERROR'
      });
    });

    monitoredTest('should handle invalid token format', async () => {
      // Arrange
      if (context.req.headers) {
        context.req.headers.authorization = 'InvalidFormat token123';
      }

      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      expect(context.res.status).toHaveBeenCalledWith(401);
      expect(context.res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/invalid.*format/i),
        code: 'AUTH_ERROR'
      });
    });
  });

  describe('Redis Errors', () => {
    monitoredTest('should handle Redis connection failures', async () => {
      // Arrange
      const token = generateToken(mockUser);
      if (context.req.headers) {
        context.req.headers.authorization = `Bearer ${token}`;
      }

      const redisMock = container.getRedisMock();
      const connectionError = new Error('Redis connection failed');
      redisMock.simulateError(connectionError);

      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      expect(context.res.status).toHaveBeenCalledWith(500);
      expect(context.res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/internal server error/i),
        code: 'REDIS_ERROR'
      });

      // Verify error was logged
      const events = TestMonitor.getTestEvents('should handle Redis connection failures');
      expect(events).toContainEqual(expect.objectContaining({
        type: 'error',
        data: expect.objectContaining({
          error: connectionError
        })
      }));
    });
  });

  describe('Validation Errors', () => {
    monitoredTest('should handle invalid request data', async () => {
      // Arrange
      const invalidUser = {
        _id: '',  // Invalid ID
        email: 'not-an-email'  // Invalid email
      };

      // Act
      const validationError = new ValidationError('Invalid user data', 'user', invalidUser);

      // Assert
      expect(validationError).toMatchObject({
        name: 'ValidationError',
        field: 'user',
        value: invalidUser,
        message: 'Invalid user data'
      });
    });
  });
});