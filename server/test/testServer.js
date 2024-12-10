const express = require('express');
const bodyParser = require('body-parser');
const { logger } = require('../utils/log');
const routeConfig = require('../utils/routeConfig');
const path = require('path');
const mongoose = require('mongoose');

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

    // Load routes and handlers
    const { handlers: subpillarsHandlers } = require('../routes/subpillars');

    // Create routers
    const pillarsRouter = express.Router({ mergeParams: true });
    const subpillarRouter = express.Router({ mergeParams: true });

    // Error handling middleware
    const errorHandler = (err, req, res, next) => {
      log.error('API Error:', err);

      // Map error types to status codes and messages
      const errorMap = {
        ValidationError: {
          status: 400,
          getMessage: (err) => err.message
        },
        AuthorizationError: {
          status: 403,
          getMessage: (err) => {
            // Map authorization errors to specific messages based on the resource type
            const resourceType = err.resourceType || 'resource';
            const action = err.action || 'modify';
            return `Not authorized to ${action} this ${resourceType.toLowerCase()}`;
          }
        },
        NotFoundError: {
          status: 404,
          getMessage: (err) => err.message
        },
        InternalError: {
          status: 500,
          getMessage: (err) => err.message
        },
        default: {
          status: 500,
          getMessage: () => 'Internal server error'
        }
      };

      const errorConfig = errorMap[err.type] || errorMap.default;
      res.status(errorConfig.status).json({ error: errorConfig.getMessage(err) });
    };

    // Resource validation middleware factory
    const validateResource = (resourceType, idParam) => async (req, res, next) => {
      try {
        const id = req.params[idParam];
        if (!mongoose.Types.ObjectId.isValid(id)) {
          const error = new Error(`${resourceType} not found`);
          error.type = 'NotFoundError';
          throw error;
        }

        const Model = require(`../models/${resourceType}`);
        const resource = await Model.findById(id);

        if (!resource) {
          const error = new Error(`${resourceType} not found`);
          error.type = 'NotFoundError';
          throw error;
        }

        req[resourceType.toLowerCase()] = resource;
        next();
      } catch (error) {
        if (!error.type) {
          error.type = 'NotFoundError';
          error.message = `${resourceType} not found`;
        }
        next(error);
      }
    };

    // Authorization middleware factory
    const authorizeResource = (resourceType, action) => async (req, res, next) => {
      try {
        const resource = req[resourceType.toLowerCase()];
        if (!resource) {
          const error = new Error(`${resourceType} not loaded`);
          error.type = 'ValidationError';
          throw error;
        }

        if (resource.createdBy.toString() !== req.user._id.toString()) {
          const error = new Error(`Not authorized to ${action} this ${resourceType.toLowerCase()}`);
          error.type = 'AuthorizationError';
          error.resourceType = resourceType;
          error.action = action;
          throw error;
        }
        next();
      } catch (error) {
        next(error);
      }
    };

    // Apply base middleware
    pillarsRouter.use(authenticateWithToken);
    subpillarRouter.use(authenticateWithToken);

    // Mount auth routes
    app.use(routeConfig.AUTH_BASE, auth.router);

    // Mount pillar-scoped routes with proper middleware chain
    app.use('/api/pillars', pillarsRouter);

    // Pillar-specific subpillar routes with validation
    pillarsRouter.get('/:pillarId/subpillars',
      validateResource('Pillar', 'pillarId'),
      subpillarsHandlers.listSubpillars
    );

    pillarsRouter.post('/:pillarId/subpillars/generate',
      validateResource('Pillar', 'pillarId'),
      authorizeResource('Pillar', 'modify'),
      subpillarsHandlers.generateSubpillars
    );

    // Mount standalone subpillar operations
    app.use('/api/pillars/subpillar', subpillarRouter);

    subpillarRouter.put('/:id',
      validateResource('Subpillar', 'id'),
      authorizeResource('Subpillar', 'modify'),
      subpillarsHandlers.updateSubpillar
    );

    subpillarRouter.delete('/:id',
      validateResource('Subpillar', 'id'),
      authorizeResource('Subpillar', 'delete'),
      subpillarsHandlers.deleteSubpillar
    );

    // Apply error handling middleware last
    app.use(errorHandler);

    // Mount other API routes
    app.use(routeConfig.NICHES_BASE, require('../routes/niches'));
    app.use(routeConfig.RESEARCH_BASE, require('../routes/research'));
    app.use(routeConfig.OUTLINES_BASE, require('../routes/outlines'));
    app.use(routeConfig.ARTICLES_BASE, require('../routes/articles'));
    app.use(routeConfig.SEO_BASE, require('../routes/seo'));

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

module.exports = { createTestServer };
