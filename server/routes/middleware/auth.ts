import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';
import { verifyToken } from '../../utils/jwt';
import { logger } from '../../utils/log';
import { createUserService } from '../../services/UserService';
import { createSessionService } from '../../services/SessionService';
import { TokenError, RedisError, AuthError } from '../../test/infrastructure/errors';
import { TestMonitor } from '../../test/infrastructure/test-monitor';
import { DatabaseClient } from '../../database/interfaces';

const log = logger('auth-middleware');

// Service types
type Services = {
  userService: ReturnType<typeof createUserService>;
  sessionService: ReturnType<typeof createSessionService>;
};

let redisClient: RedisClientType | null = null;
let services: Services;

// Initialize services with database client
export function initializeServices(dbClient: DatabaseClient): Services {
  services = {
    userService: createUserService(dbClient),
    sessionService: createSessionService(dbClient)
  };
  return services;
}

const initRedis = async (client?: RedisClientType): Promise<RedisClientType> => {
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

    redisClient.on('error', (err: Error) => {
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
        TestMonitor.recordEvent('redis_error', {
          type: 'RedisError',
          message: (error as Error).message,
          operation: 'connection'
        });
      }
      throw new RedisError('Redis connection failed', 'connect');
    }
  }

  return redisClient;
};

const authenticateWithToken = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];

    // Validate session
    const session = await services.sessionService.getSessionByToken(token);
    if (!session) {
      throw new AuthError('Invalid or expired session', 'SESSION_INVALID');
    }

    // Get user
    const user = await services.userService.get(session.userId);
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Attach user and session to request
    req.user = user;
    req.session.userId = session.userId;
    req.session.lastActivityAt = session.lastActivityAt;
    next();
  } catch (error) {
    log.error('Auth middleware error:', error);

    if (error instanceof TokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        code: error.code
      });
    }

    if (error instanceof AuthError) {
      return res.status(401).json({
        error: error.message,
        code: error.code
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

const requireUser = (req: Request, res: Response, next: NextFunction): void | Response => {
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
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Add session cleanup middleware
const cleanupSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await services.sessionService.cleanupExpiredSessions();
    next();
  } catch (error) {
    log.error('Session cleanup error:', error);
    next(); // Continue even if cleanup fails
  }
};

export {
  authenticateWithToken,
  requireUser,
  initRedis,
  cleanupSessions
};
