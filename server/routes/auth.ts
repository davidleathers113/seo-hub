import express, { Request, Response } from 'express';
import { logger } from '../utils/log';
import { generateToken } from '../utils/jwt';
import { DatabaseClient } from '../database/interfaces';
import { UserService } from '../services/UserService';
import { SessionService } from '../services/SessionService';
import { authenticateWithToken } from './middleware/auth';
import { isValidEmail, isNonEmptyString } from '../utils/validation';
import { ValidationError } from '../database/mongodb/client';

const log = logger('auth-routes');

// Extend express Request type to include session token
declare module 'express-session' {
  interface SessionData {
    token?: string;
  }
}

// Extend express Request type to include user
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      [key: string]: any;
    };
  }
}

export function createAuthRouter(userService: UserService, sessionService: SessionService) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        log.warn('Login attempt with missing credentials');
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      if (!isValidEmail(email)) {
        log.warn(`Invalid email format attempted: ${email}`);
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      // Authentication attempt
      const user = await userService.authenticateWithPassword(email, password);

      if (!user) {
        log.info(`Failed login attempt for email: ${email}`);
        return res.status(400).json({
          error: 'Invalid credentials'
        });
      }

      // Create session
      const session = await sessionService.createSession(
        user.id,
        req.get('User-Agent'),
        req.ip
      );

      log.info(`Successful login for user: ${email}`);
      return res.json({
        user,
        token: session.token
      });

    } catch (error) {
      log.error('Login error:', { error: (error as Error).message, stack: (error as Error).stack });
      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during login'
      });
    }
  });

  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      if (!isNonEmptyString(password) || password.length < 8) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long'
        });
      }

      const result = await userService.createUser({ email, password, name });

      // Create session for new user
      const session = await sessionService.createSession(
        result.user.id,
        req.get('User-Agent'),
        req.ip
      );

      log.info(`User registered successfully: ${email}`);
      return res.status(201).json({
        user: result.user,
        token: session.token
      });

    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }

      log.error('Registration error:', { error: (error as Error).message, stack: (error as Error).stack });
      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during registration'
      });
    }
  });

  router.post('/logout', authenticateWithToken, async (req, res) => {
    try {
      const token = req.session.token;
      if (!token) {
        return res.status(400).json({ error: 'No session token found' });
      }
      await sessionService.invalidateSession(token);
      res.json({ success: true });
    } catch (error) {
      log.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during logout'
      });
    }
  });

  router.get('/me', authenticateWithToken, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    res.json(req.user);
  });

  router.get('/sessions', authenticateWithToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const sessions = await sessionService.getUserSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      log.error('Get sessions error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching sessions'
      });
    }
  });

  router.post('/logout/all', authenticateWithToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      await sessionService.invalidateUserSessions(req.user.id);
      res.json({ success: true });
    } catch (error) {
      log.error('Logout all error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during logout'
      });
    }
  });

  return router;
}

// Export the default router for backward compatibility
export default createAuthRouter;