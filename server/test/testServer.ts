import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { logger } from '../utils/log';
import { DatabaseClient } from '../database/interfaces';
import { getDatabase } from '../database';
import { TestMonitor } from './infrastructure/test-monitor';
import { mockRedis, errorStates, clearAllMocks } from './mocks/redis';

const log = logger('testServer');

// Mock all dependencies before requiring any routes
jest.mock('../utils/log', () => ({
  logger: (name: string) => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn()
  })
}));

// Mock Redis and ensure it's loaded before other modules
jest.mock('redis', () => require('./mocks/redis'));

// Mock UserService
jest.mock('../services/UserService');

// Mock auth middleware
jest.mock('../routes/middleware/auth', () => require('../routes/__mocks__/auth'));

// Use the same JWT secret as helpers.js
const TEST_JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.NODE_ENV = 'test';

// Reset all mocks before creating server
function resetMocks(): void {
  clearAllMocks();
  errorStates.connectionError = false;
  errorStates.operationError = false;
}

interface TestServer {
  app: Express;
  server: any;
  close: () => Promise<void>;
}

export async function createTestServer(): Promise<TestServer> {
  try {
    // Get database instance
    const db: DatabaseClient = getDatabase();

    // Check database connection
    try {
      await db.ping();
    } catch (error) {
      throw new Error('Database not connected: ' + error);
    }

    resetMocks();
    const app = express();

    // Basic middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Add request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      TestMonitor.recordEvent('http_request', {
        method: req.method,
        path: req.path,
        headers: req.headers
      });
      next();
    });

    // Initialize Redis
    await mockRedis.connect();

    // Initialize auth
    const auth = require('../routes/auth');
    await auth.initRedis(mockRedis);

    // Initialize middleware
    const { authenticateWithToken } = require('../routes/middleware/auth');

    // Mount routes
    app.use('/auth', auth.router);

    const routes = [
      { path: '/api/niches', module: '../routes/niches' },
      { path: '/api/research', module: '../routes/research' },
      { path: '/api/outlines', module: '../routes/outlines' },
      { path: '/api/articles', module: '../routes/articles' },
      { path: '/api/seo', module: '../routes/seo' }
    ];

    routes.forEach(({ path, module }) => {
      const router = require(module);
      app.use(path, authenticateWithToken, router);
    });

    // Error handling
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      TestMonitor.recordEvent('error', {
        type: err.name,
        message: err.message,
        path: req.path
      });

      if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }

      res.status(500).json({ error: 'Internal server error' });
    });

    // Create server
    const server = app.listen(0);

    // Create test server instance with proper cleanup
    const testServer: TestServer = {
      app,
      server,
      close: async () => {
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
        await mockRedis.disconnect();
        await db.disconnect();
        TestMonitor.recordEvent('server_closed', {
          timestamp: new Date()
        });
      }
    };

    // Record server creation
    const address = server.address();
    TestMonitor.recordEvent('server_created', {
      port: address.port,
      timestamp: new Date()
    });

    return testServer;
  } catch (error) {
    TestMonitor.recordEvent('server_creation_failed', {
      error: (error as Error).message,
      timestamp: new Date()
    });
    throw error;
  }
}