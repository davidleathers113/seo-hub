import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { createClient, RedisClientType } from 'redis';
import { verifyToken } from '../../utils/jwt';
import { logger } from '../../utils/log';
import { createUserService } from '../../services/UserService';
import { createSessionService } from '../../services/SessionService';
import { TokenError, RedisError, AuthError } from '../../test/infrastructure/errors';
import { TestMonitor } from '../../test/infrastructure/test-monitor';
import { DatabaseClient, User } from '../../database/interfaces';
import { UserModel, UserDocument } from '../../database/mongodb/models/User';
import @supabase/supabase-js, { Database["public"]["Tables"][TableName]["Row"], Types } from '@supabase/supabase-js';

const log = logger('auth-middleware');

// Service types
type Services = {
  userService: ReturnType<typeof createUserService>;
  sessionService: ReturnType<typeof createSessionService>;
};

let redisClient: RedisClientType | null = null;
let services: Services | null = null;

// Initialize services with database client
export function initializeServices(dbClient: DatabaseClient): Services {
  if (!services) {
    services = {
      userService: createUserService(dbClient),
      sessionService: createSessionService(dbClient)
    };
  }
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

// Define the authenticated request type
export interface AuthenticatedRequest extends Request {
  user: User & UserDocument;
}

export const authenticateWithToken: RequestHandler = async (req, res, next) => {
  if (!services) {
    return res.status(500).json({ error: 'Services not initialized' });
  }

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

    // Get user from MongoDB directly
    const userDoc = await UserModel.findById(new @supabase/supabase-js.Types.ObjectId(session.userId)).exec();
    if (!userDoc) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Cast the userDoc to include _id with the correct type
    const typedUserDoc = userDoc as Document<Types.ObjectId, {}, UserDocument> & UserDocument & { _id: Types.ObjectId };

    // Convert and attach user and session to request
    const user = typedUserDoc.toJSON();
    (req as AuthenticatedRequest).user = {
      ...user,
      id: typedUserDoc._id.toString(),
      generateAuthToken: typedUserDoc.generateAuthToken.bind(typedUserDoc),
      regenerateToken: typedUserDoc.regenerateToken.bind(typedUserDoc),
    } as User & UserDocument;

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

export const requireUser: RequestHandler = (req, res, next) => {
  if (!(req as AuthenticatedRequest).user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'USER_REQUIRED'
    });
  }
  next();
};

// Add session cleanup middleware
export const cleanupSessions: RequestHandler = async (req, res, next) => {
  if (!services) {
    return next();
  }

  try {
    await services.sessionService.cleanupExpiredSessions();
    next();
  } catch (error) {
    log.error('Session cleanup error:', error);
    next(); // Continue even if cleanup fails
  }
};

export {
  initRedis
};
