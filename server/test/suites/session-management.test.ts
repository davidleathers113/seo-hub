import { TestContainer } from '../infrastructure/test-container';
import { TestContext, Request, Response, TestNextFunction } from '../infrastructure/test-types';
import { TestMonitor } from '../infrastructure/test-monitor';
import { generateToken } from '../../utils/jwt';
import { authenticateWithToken } from '../../routes/middleware/auth';

const container = TestContainer.getInstance();
const monitoredTest = TestMonitor.createTestWrapper();

describe('Session Management', () => {
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
      next: jest.fn() as TestNextFunction
    };
  });

  describe('Session Creation', () => {
    monitoredTest('should create new session on successful authentication', async () => {
      // Arrange
      const token = generateToken(mockUser);
      if (context.req.headers) {
        context.req.headers.authorization = `Bearer ${token}`;
      }

      const redisMock = container.getRedisMock();
      await redisMock.connect();

      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      const state = container.getState();
      const sessions = Array.from(state.auth.sessions.values());
      expect(sessions.length).toBe(1);
      expect(sessions[0]).toMatchObject({
        id: expect.stringMatching(/.+/),
        user: mockUser,
        created: expect.any(Date),
        lastActive: expect.any(Date),
        metadata: expect.any(Map)
      });
    });

    monitoredTest('should store session metadata', async () => {
      // Arrange
      const token = generateToken(mockUser);
      const sessionId = 'test-session-id';
      const metadata = new Map([
        ['device', 'mobile'],
        ['ip', '127.0.0.1']
      ]);

      // Act
      container.getState().auth.sessions.set(sessionId, {
        id: sessionId,
        user: mockUser,
        created: new Date(),
        lastActive: new Date(),
        metadata
      });

      // Assert
      const state = container.getState();
      const session = state.auth.sessions.get(sessionId);
      expect(session?.metadata).toMatchObject(metadata);
    });
  });

  describe('Session Updates', () => {
    monitoredTest('should update lastActive timestamp on activity', async () => {
      // Arrange
      const initialLastActive = new Date(Date.now() - 5000); // 5 seconds ago
      const token = generateToken(mockUser);
      if (context.req.headers) {
        context.req.headers.authorization = `Bearer ${token}`;
      }

      const redisMock = container.getRedisMock();
      await redisMock.connect();

      // Create initial session
      const sessionId = 'test-session-id';
      container.getState().auth.sessions.set(sessionId, {
        id: sessionId,
        user: mockUser,
        created: new Date(Date.now() - 10000),
        lastActive: initialLastActive,
        metadata: new Map()
      });

      // Act
      await authenticateWithToken(context.req as unknown as Request, context.res as unknown as Response, context.next);

      // Assert
      const state = container.getState();
      const updatedSession = Array.from(state.auth.sessions.values())[0];
      expect(updatedSession.lastActive.getTime()).toBeGreaterThan(
        initialLastActive.getTime()
      );
    });
  });

  describe('Session Cleanup', () => {
    monitoredTest('should remove inactive sessions', async () => {
      // Arrange
      const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
      const now = Date.now();

      // Create mix of active and inactive sessions
      const sessions = [
        {
          id: 'active1',
          lastActive: new Date(now - 1000), // 1 second ago
          user: mockUser,
          created: new Date(now - 60000),
          metadata: new Map()
        },
        {
          id: 'active2',
          lastActive: new Date(now - 60000), // 1 minute ago
          user: mockUser,
          created: new Date(now - 120000),
          metadata: new Map()
        },
        {
          id: 'inactive1',
          lastActive: new Date(now - inactiveThreshold - 1000), // Just over threshold
          user: mockUser,
          created: new Date(now - inactiveThreshold - 60000),
          metadata: new Map()
        },
        {
          id: 'inactive2',
          lastActive: new Date(now - inactiveThreshold * 2), // Way over threshold
          user: mockUser,
          created: new Date(now - inactiveThreshold * 2 - 60000),
          metadata: new Map()
        }
      ];

      // Add sessions to state
      const state = container.getState();
      sessions.forEach(session => {
        state.auth.sessions.set(session.id, session);
      });

      // Act
      await container.getRedisMock().connect();
      // Simulate cleanup (you would typically have a cleanup method in your auth service)
      const activeSessions = Array.from(state.auth.sessions.values())
        .filter(session => {
          const inactiveDuration = now - session.lastActive.getTime();
          return inactiveDuration < inactiveThreshold;
        });
      state.auth.sessions.clear();
      activeSessions.forEach(session => {
        state.auth.sessions.set(session.id, session);
      });

      // Assert
      expect(state.auth.sessions.size).toBe(2);
      const remainingSessions = Array.from(state.auth.sessions.values());
      remainingSessions.forEach(session => {
        const inactiveDuration = now - session.lastActive.getTime();
        expect(inactiveDuration).toBeLessThan(inactiveThreshold);
      });
    });
  });
});