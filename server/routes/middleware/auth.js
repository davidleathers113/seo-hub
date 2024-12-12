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
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        error: 'Missing required field: headers.authorization',
        field: 'headers.authorization',
        code: 'VALIDATION_ERROR'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);

      // Check Redis connection and token blacklist
      try {
        const client = await initRedis();
        if (!client?.isReady) {
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            code: 'REDIS_ERROR'
          });
        }

        const isBlacklisted = await client.get(`bl_${token}`);
        if (isBlacklisted) {
          return res.status(401).json({
            error: 'Token has been invalidated',
            code: 'TOKEN_ERROR'
          });
        }

        const user = await UserService.get(decoded.id);
        if (!user) {
          return res.status(401).json({
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        }

        req.user = user;
        next();
      } catch (redisError) {
        log.error('Redis error:', redisError);
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          code: 'REDIS_ERROR'
        });
      }
    } catch (tokenError) {
      return res.status(403).json({
        error: 'Token verification failed',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    log.error('Authentication error:', error);
    return res.status(401).json({
      error: error.message || 'Authentication failed',
      code: error.code || 'AUTH_FAILED'
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
