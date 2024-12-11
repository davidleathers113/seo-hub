import { TestContainer } from '../infrastructure/test-container';
import { TestMonitor } from '../infrastructure/test-monitor';
import { TestServer } from '../infrastructure/test-types';
import { createTestServer } from '../testServer';
import supertest from 'supertest';
import type { SuperTest, Test } from 'supertest';

const container = TestContainer.getInstance();
const monitoredTest = TestMonitor.createTestWrapper();

describe('Authentication Integration', () => {
  let app: Express.Application;
  let agent: SuperTest<Test>;
  let server: TestServer;

  beforeAll(async () => {
    server = await createTestServer();
    app = server.app;
    agent = supertest(app);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await container.reset();
  });

  describe('Authentication Flow', () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'securePassword123',
      metadata: {
        firstName: 'Test',
        lastName: 'User'
      }
    };

    monitoredTest('should complete full authentication lifecycle', async () => {
      // 1. Register new user
      const registerResponse = await agent
        .post('/auth/register')
        .send(mockUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(registerResponse.body).toMatchObject({
        user: expect.objectContaining({
          email: mockUser.email,
          metadata: expect.objectContaining(mockUser.metadata)
        }),
        token: expect.stringMatching(/.+/)
      });

      const initialToken = registerResponse.body.token;

      // 2. Login with credentials
      const loginResponse = await agent
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(loginResponse.body).toMatchObject({
        user: expect.objectContaining({
          email: mockUser.email
        }),
        token: expect.stringMatching(/.+/)
      });

      const loginToken = loginResponse.body.token;

      // 3. Access protected route
      const protectedResponse = await agent
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(protectedResponse.body).toMatchObject(
        expect.objectContaining({
          email: mockUser.email
        })
      );

      // 4. Logout
      const logoutResponse = await agent
        .post('/auth/logout')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(logoutResponse.body).toMatchObject({
        success: true,
        message: expect.stringMatching(/logged out/i)
      });

      // 5. Verify token is blacklisted
      const blacklistedResponse = await agent
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(blacklistedResponse.body).toMatchObject({
        error: expect.stringMatching(/invalid.*token/i),
        code: 'TOKEN_ERROR'
      });
    });

    monitoredTest('should handle invalid credentials', async () => {
      // Attempt login with invalid credentials
      const invalidLoginResponse = await agent
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongPassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(invalidLoginResponse.body).toMatchObject({
        error: expect.stringMatching(/invalid credentials/i),
        code: 'AUTH_ERROR'
      });
    });

    monitoredTest('should handle invalid registration data', async () => {
      // Attempt registration with invalid data
      const invalidRegisterResponse = await agent
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(invalidRegisterResponse.body).toMatchObject({
        error: expect.stringMatching(/validation/i),
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/email|password/i)
          })
        ])
      });
    });

    monitoredTest('should handle concurrent sessions', async () => {
      // 1. Register user
      const { body: registerData } = await agent
        .post('/auth/register')
        .send(mockUser)
        .expect(201);

      // 2. Create multiple sessions
      const sessions = await Promise.all(
        Array(3).fill(null).map(async () => {
          const { body } = await agent
            .post('/auth/login')
            .send({
              email: mockUser.email,
              password: mockUser.password
            })
            .expect(200);
          return body;
        })
      );

      // 3. Verify all sessions are valid
      await Promise.all(
        sessions.map(async (session) => {
          await agent
            .get('/auth/me')
            .set('Authorization', `Bearer ${session.token}`)
            .expect(200);
        })
      );

      // 4. Verify session tracking
      const state = container.getState();
      const userSessions = Array.from(state.auth.sessions.values())
        .filter(session => session.user.email === mockUser.email);

      expect(userSessions.length).toBe(sessions.length);
    });
  });
});