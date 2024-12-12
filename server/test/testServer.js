const express = require('express');
const bodyParser = require('body-parser');
const { logger } = require('../utils/log');
const routeConfig = require('../utils/routeConfig');
const path = require('path');
const mongoose = require('mongoose');
const { checkMongoDBServer, checkMongooseConnection } = require('./analysis/mongoose-connection-check');
const { TestMonitor } = require('./infrastructure/test-monitor');

const log = logger('testServer');

// Mock all dependencies before requiring any routes
jest.mock('../utils/log', () => ({
  logger: (name) => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn()
  })
}));

// Mock Redis and ensure it's loaded before other modules
const { mockRedis, errorStates, clearAllMocks } = require('./mocks/redis');
jest.mock('redis', () => require('./mocks/redis'));

// Mock UserService
jest.mock('../services/user');

// Mock auth middleware
jest.mock('../routes/middleware/auth', () => require('../routes/__mocks__/auth'));

// Use the same JWT secret as helpers.js
const TEST_JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.NODE_ENV = 'test';

// Reset all mocks before creating server
function resetMocks() {
  clearAllMocks();
  errorStates.connectionError = false;
  errorStates.operationError = false;
}

async function createTestServer() {
  try {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
      await mongoose.connect(mongoUri);
    }

    // Check mongoose connection first
    console.log('\n=== Checking Mongoose Connection ===');
    const connectionChecks = await checkMongooseConnection();
    console.log('Connection state:', connectionChecks);
    
    if (connectionChecks.connectionState !== 'connected') {
      throw new Error('Mongoose not connected: ' + JSON.stringify(connectionChecks, null, 2));
    }

    resetMocks();
    const app = express();

    // Basic middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Add request logging middleware
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
    app.use((err, req, res, next) => {
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

    // Create test server instance with proper cleanup
    const testServer = {
      app,
      server,
      close: async () => {
        await new Promise((resolve) => {
          server.close(() => resolve());
        });
        await mockRedis.disconnect();
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
      error: error.message,
      timestamp: new Date()
    });
    throw error;
  }
}

module.exports = {
  createTestServer
};
