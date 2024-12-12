import express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import bodyParser from 'body-parser';
import { TestMonitor } from './test-monitor';

// Use require for JS modules
const { mockRedis } = require('../mocks/redis');

interface TestServer {
  app: express.Application;
  server: Server;
  close: () => Promise<void>;
}

/**
 * Manages test server lifecycle (creation, initialization, cleanup)
 */
export class ServerLifecycle {
  private static instance: ServerLifecycle;
  private activeServers: Set<TestServer> = new Set();

  private constructor() {}

  static getInstance(): ServerLifecycle {
    if (!ServerLifecycle.instance) {
      ServerLifecycle.instance = new ServerLifecycle();
    }
    return ServerLifecycle.instance;
  }

  /**
   * Creates and initializes a test server
   */
  async createServer(): Promise<TestServer> {
    try {
      // Create Express app
      const app = express();

      // Basic middleware
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      // Request logging
      app.use((req, res, next) => {
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
      const auth = require('../../routes/auth');
      await auth.initRedis(mockRedis);

      // Initialize middleware
      const { authenticateWithToken } = require('../../routes/middleware/auth');

      // Mount routes
      app.use('/auth', auth.router);

      const routes = [
        { path: '/api/niches', module: '../../routes/niches' },
        { path: '/api/research', module: '../../routes/research' },
        { path: '/api/outlines', module: '../../routes/outlines' },
        { path: '/api/articles', module: '../../routes/articles' },
        { path: '/api/seo', module: '../../routes/seo' }
      ];

      routes.forEach(({ path, module }) => {
        const router = require(module);
        app.use(path, authenticateWithToken, router);
      });

      // Error handling
      app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        TestMonitor.recordEvent('error', {
          type: err.name,
          message: err.message,
          path: req.path
        });

        if (err.name === 'CastError' && err.kind === 'ObjectId') {
          return res.status(404).json({ error: 'Invalid ID format' });
        }

        res.status(500).json({ error: 'Internal server error' });
      });

      // Create server
      const server = app.listen(0);

      // Create test server instance
      const testServer: TestServer = {
        app,
        server,
        close: async () => {
          await new Promise<void>((resolve) => {
            server.close(() => resolve());
          });
          await mockRedis.disconnect();
          this.activeServers.delete(testServer);
          TestMonitor.recordEvent('server_closed', {
            timestamp: new Date()
          });
        }
      };

      // Track active server
      this.activeServers.add(testServer);

      // Get server address
      const address = server.address();
      if (address && typeof address !== 'string') {
        TestMonitor.recordEvent('server_created', {
          port: (address as AddressInfo).port,
          timestamp: new Date()
        });
      }

      return testServer;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      TestMonitor.recordEvent('server_creation_failed', {
        error: errorMessage,
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Closes all active servers
   */
  async closeAll(): Promise<void> {
    const servers = Array.from(this.activeServers);
    await Promise.all(servers.map(server => server.close()));
  }
}

export const serverLifecycle = ServerLifecycle.getInstance();
