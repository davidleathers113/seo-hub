
// Unit tests for: createTestServer




const { createTestServer } = require('../testServer');
const express = require('express');
const { logger } = require('../../utils/log');
const mongoose = require('mongoose');
// Mock logger
jest.mock("../../utils/log", () => {
  const originalModule = jest.requireActual("../../utils/log");
  return {
    __esModule: true,
    ...originalModule,
    logger: () => ({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn()
    })
  };
});

// Mock mongoose
jest.mock("mongoose", () => {
  const originalModule = jest.requireActual("mongoose");
  return {
    __esModule: true,
    ...originalModule,
    Types: {
      ObjectId: {
        isValid: jest.fn().mockReturnValue(true)
      }
    }
  };
});

// Mock express
jest.mock("express", () => {
  const originalModule = jest.requireActual("express");
  return {
    __esModule: true,
    ...originalModule,
    Router: jest.fn(() => ({
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }))
  };
});

describe('createTestServer() createTestServer method', () => {
  let app;

  beforeEach(async () => {
    app = await createTestServer();
  });

  describe('Happy Paths', () => {
    it('should create an express app with the expected middleware', () => {
      // Test that the app is an instance of express
      expect(app).toBeDefined();
      expect(typeof app.use).toBe('function');
    });

    it('should configure routes correctly', () => {
      // Test that routes are configured correctly
      expect(express.Router).toHaveBeenCalled();
    });

    it('should initialize Redis and configure auth components', () => {
      // Test that Redis and auth components are initialized
      expect(auth.initRedis).toHaveBeenCalledWith(mockRedisClient);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid ObjectId gracefully', async () => {
      // Mock ObjectId validation to return false
      mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

      // Simulate a request with an invalid ObjectId
      const req = { params: { id: 'invalid-id' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const validateResource = app._router.stack.find(layer => layer.name === 'validateResource').handle;
      await validateResource(req, res, next);

      // Expect a 404 response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Subpillar not found' });
    });

    it('should handle missing resource gracefully', async () => {
      // Mock Model.findById to return null
      const Model = require('../models/Subpillar');
      Model.findById = jest.fn().mockResolvedValue(null);

      // Simulate a request with a valid ObjectId but missing resource
      const req = { params: { id: 'valid-id' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const validateResource = app._router.stack.find(layer => layer.name === 'validateResource').handle;
      await validateResource(req, res, next);

      // Expect a 404 response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Subpillar not found' });
    });
  });
});

// End of unit tests for: createTestServer
