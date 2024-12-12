import express from 'express';
import type { Express } from 'express-serve-static-core';
import type { Request, Response, NextFunction } from '../../types/express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import { TestContainer } from './test-container';
import { TestMonitor } from './test-monitor';
import path from 'path';

interface TestServer {
  app: Express;
  server: Server;
  close: () => Promise<void>;
}

export class TestServerFactory {
  private static instance: TestServerFactory;
  private container: TestContainer;

  private constructor() {
    this.container = TestContainer.getInstance();
  }

  static getInstance(): TestServerFactory {
    if (!TestServerFactory.instance) {
      TestServerFactory.instance = new TestServerFactory();
    }
    return TestServerFactory.instance;
  }

  async create(): Promise<TestServer> {
    // Create Express app
    const app = express();

    // Basic middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Request logging for tests
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (process.env.NODE_ENV === 'test') {
        TestMonitor.recordEvent('http_request', {
          method: req.method,
          url: req.url,
          originalUrl: req.originalUrl,
          headers: req.headers
        });
      }
      next();
    });

    try {
      // Get Redis mock from container
      const redisMock = this.container.getRedisMock();
      await redisMock.connect();

      // Initialize auth components
      const auth = require(path.resolve(__dirname, '../../routes/auth'));
      await auth.initRedis(redisMock);

      // Initialize middleware
      const { authenticateWithToken } = require(path.resolve(__dirname, '../../routes/middleware/auth'));

      // Mount routes
      app.use('/auth', auth.router);

      // API routes with their relative paths
      const routes = [
        { path: '/api/niches', module: '../../routes/niches' },
        { path: '/api/research', module: '../../routes/research' },
        { path: '/api/outlines', module: '../../routes/outlines' },
        { path: '/api/articles', module: '../../routes/articles' },
        { path: '/api/seo', module: '../../routes/seo' },
        { path: '/api/pillars', module: '../../routes/pillars' },
        { path: '/api/subpillars', module: '../../routes/subpillars' }
      ];

      routes.forEach(({ path: routePath, module }) => {
        const router = require(path.resolve(__dirname, module));
        app.use(routePath, authenticateWithToken, router);
      });

      // Error handling middleware
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (process.env.NODE_ENV === 'test') {
          TestMonitor.recordEvent('error', {
            type: err.name,
            message: err.message,
            stack: err.stack
          });
        }
        
        if (err.name === 'CastError' && (err as any).kind === 'ObjectId') {
          return res.status(404).json({ error: 'Invalid ID format' });
        }
        
        res.status(500).json({ error: 'Internal server error' });
      });

      // Create server
      const server = app.listen(0); // Random port for testing

      // Return server instance with cleanup
      return {
        app,
        server,
        close: async () => {
          await new Promise<void>((resolve) => {
            server.close(() => resolve());
          });
          await redisMock.disconnect();
        }
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        TestMonitor.recordEvent('server_error', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }
}

// Export factory instance
export const testServerFactory = TestServerFactory.getInstance();
