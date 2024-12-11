const express = require('express');
const bodyParser = require('body-parser');
const { logger } = require('../utils/log');
const routeConfig = require('../utils/routeConfig');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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

// Mock Redis
jest.mock('redis', () => require('./mocks/redisMock'));

// Mock UserService
jest.mock('../services/user');

// Mock auth middleware
jest.mock('../routes/middleware/auth', () => require('../routes/__mocks__/auth'));

// Use the same JWT secret as helpers.js
const TEST_JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.NODE_ENV = 'test';

let mongoServer;

async function createTestServer() {
  const app = express();

  // Basic middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path} (${req.originalUrl})`);
    next();
  });

  try {
    // Initialize and configure auth components
    const auth = require('../routes/auth');
    const { authenticateWithToken } = require('../routes/middleware/auth');
    const { mockRedisClient } = require('./mocks/redisMock');

    // Initialize Redis
    auth.initRedis(mockRedisClient);
    mockRedisClient.get.mockImplementation((key) => Promise.resolve(null));

    // Mount auth routes
    app.use('/auth', auth.router);

    // Mount other API routes
    const niches = require('../routes/niches');
    const research = require('../routes/research');
    const outlines = require('../routes/outlines');
    const articles = require('../routes/articles');
    const seo = require('../routes/seo');

    // Mount routes
    app.use('/api/niches', niches);
    app.use('/api/research', research);
    app.use('/api/outlines', outlines);
    app.use('/api/articles', articles);
    app.use('/api/seo', seo);

    // Add MongoDB ID validation error handler
    app.use((err, req, res, next) => {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).json({ error: 'Invalid ID format' });
      }
      next(err);
    });

    // Add 404 handler
    app.use((req, res) => {
      console.log('[DEBUG] 404 Not Found:', {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        params: req.params
      });
      res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
      });
    });

    // Add error handler
    app.use((err, req, res, next) => {
      console.error('[DEBUG] Server error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        params: req.params
      });
      res.status(500).json({ error: 'Internal server error' });
    });

    return app;
  } catch (error) {
    console.error('[DEBUG] Server creation failed:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

async function setupTestServer() {
  return createTestServer();
}

async function teardownTestServer() {
  // No need to disconnect here as it's handled in test/setup.js
}

module.exports = {
  createTestServer,
  setupTestServer,
  teardownTestServer
};
