import { TestContainer } from '../infrastructure/test-container';
import { TestContext, Request, Response } from '../infrastructure/test-types';
import { TestMonitor } from '../infrastructure/test-monitor';
import { generateToken, verifyToken } from '../../utils/jwt';
import { authenticateWithToken } from '../../routes/middleware/auth';

const container = TestContainer.getInstance();
const monitoredTest = TestMonitor.createTestWrapper();

describe('Token Lifecycle', () => {
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

    // Create properly typed request and response objects
    const req = {
      headers: {},
      get: jest.fn((name: string) => req.headers[name.toLowerCase()]),
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

  describe('Token Generation and Validation', () => {
    monitoredTest('should generate valid JWT token', async () => {
      // Act
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      // Assert
      expect(decoded).toEqual({
        id: mockUser._id,
        email: mockUser.email,
        exp: expect.any(Number),
        iat: expect.any(Number)
      });
    });

    monitoredTest('should store token in container state', async () => {
      // Act
      const token = generateToken(mockUser);
      container.addToken(token, {
        id: mockUser._id,
        email: mockUser.email
      });

      // Assert
      const state = container.getState();
      expect(state.auth.tokens.get(token)).toEqual({
        value: token,
        expires: expect.any(Date),
        claims: {
          id: mockUser._id,
          email: mockUser.email
        },
        blacklisted: false
      });
    });
  });

  describe('Token Expiration', () => {
    monitoredTest('should reject expired tokens', async () => {
      // Arrange
      const token = generateToken(mockUser);
      container.addToken(token, {
        id: mockUser._id,
        email: mockUser.email
      });

      const tokenState = container.getState().auth.tokens.get(token);
      if (!tokenState) throw new Error('Token not found in state');

      tokenState.expires = new Date(Date.now() - 1000); // Expired 1 second ago

      if (context.req.headers) {
        context.req.headers.authorization = `Bearer ${token}`;
      }

      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      expect(context.res.status).toHaveBeenCalledWith(403);
      expect(context.res.json).toHaveBeenCalledWith({
        error: 'Token verification failed',
        code: 'INVALID_TOKEN'
      });
    });
  });

  describe('Token Blacklisting', () => {
    monitoredTest('should reject blacklisted tokens', async () => {
      // Arrange
      const token = generateToken(mockUser);
      container.addToken(token, {
        id: mockUser._id,
        email: mockUser.email
      });
      container.blacklistToken(token);

      if (context.req.headers) {
        context.req.headers.authorization = `Bearer ${token}`;
      }

      const redisMock = container.getRedisMock();
      await redisMock.connect();
      await redisMock.set(`blacklist:${token}`, 'true');

      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      expect(context.res.status).toHaveBeenCalledWith(401);
      expect(context.res.json).toHaveBeenCalledWith({
        error: expect.any(String),
        code: 'TOKEN_ERROR'
      });

      // Verify state
      const state = container.getState();
      expect(state.auth.blacklist.has(token)).toBe(true);
      expect(state.auth.tokens.get(token)?.blacklisted).toBe(true);
    });
  });
});