const { createClient } = require('redis');
const { verifyToken } = require('../../utils/jwt');
const { logger } = require('../../utils/log');
const UserService = require('../../services/user');
const { ProtocolGuard } = require('../../test/infrastructure/protocol-guard');
const { TokenError, RedisError, AuthError } = require('../../test/infrastructure/errors');
const { TestMonitor } = require('../../test/infrastructure/test-monitor');

const log = logger('auth-middleware');

let redisClient;

const initRedis = async (client) => {
  if (client) {
    redisClient = client;
    return client;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('connect', () => {
      log.info('Redis connected successfully');
      if (process.env.NODE_ENV === 'test') {
        TestMonitor.recordEvent('redis_connect', { timestamp: new Date() });
      }
    });

    redisClient.on('error', (err) => {
      log.error('Redis Client Error:', err);
      if (process.env.NODE_ENV === 'test') {
        TestMonitor.recordEvent('redis_error', { error: err.message });
      }
    });

    try {
      await redisClient.connect();
    } catch (error) {
      log.error('Redis connection failed:', error);
      if (process.env.NODE_ENV === 'test') {
        TestMonitor.recordEvent('redis_connection_failed', { error: error.message });
      }
      throw new RedisError('Redis connection failed', 'connect');
    }
  }

  return redisClient;
};

const authenticateWithToken = async (req, res, next) => {
  try {
    // Validate request structure
    ProtocolGuard.validateAuthRequest(req);

    const token = req.headers.authorization.split(' ')[1];

    if (process.env.NODE_ENV === 'test') {
      TestMonitor.recordEvent('auth_attempt', { token: token.substring(0, 10) + '...' });
    }

    try {
      const decoded = verifyToken(token);

      // Check if token is blacklisted
      const client = await initRedis();
      if (!client?.isReady) {
        throw new RedisError('Redis client not ready', 'status_check');
      }

      const isBlacklisted = await client.get(`bl_${token}`);
      if (isBlacklisted) {
        throw new TokenError('Token has been invalidated', { token });
      }

      const user = await UserService.get(decoded.id);
      if (!user) {
        throw new AuthError('User not found', 'USER_NOT_FOUND');
      }

      req.user = user;

      if (process.env.NODE_ENV === 'test') {
        TestMonitor.recordEvent('auth_success', {
          userId: user._id,
          email: user.email
        });
      }

      next();
    } catch (error) {
      if (error instanceof TokenError) {
        return res.status(401).json({
          error: error.message,
          code: error.code
        });
      }

      if (error instanceof RedisError) {
        log.error('Redis operation failed:', error);
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          code: 'REDIS_ERROR'
        });
      }

      if (error instanceof AuthError) {
        return res.status(401).json({
          error: error.message,
          code: error.code
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({
          error: 'Token verification failed',
          code: 'INVALID_TOKEN'
        });
      }

      throw error; // Re-throw unexpected errors
    }
  } catch (error) {
    log.error('Authentication failed:', error);

    if (process.env.NODE_ENV === 'test') {
      TestMonitor.recordEvent('auth_error', {
        type: error.constructor.name,
        message: error.message
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
        field: error.field,
        code: 'VALIDATION_ERROR'
      });
    }

    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

const requireUser = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthError('Authentication required', 'USER_REQUIRED');
    }
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({
        error: error.message,
        code: error.code
      });
    }
    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  authenticateWithToken,
  requireUser,
  initRedis
};
