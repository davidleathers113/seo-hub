import express from 'express';
import { createUserService } from '../services/UserService';
import { generateToken } from '../utils/jwt';
import { authenticateWithToken } from './middleware/auth';
import { validateEmail, validatePassword } from '../utils/validation';
import { ValidationError } from '../database/mongodb/client';
import { logger } from '../utils/log';

const router = express.Router();
const userService = createUserService();

// Initialize logger based on environment
const log = process.env.NODE_ENV === 'test'
  ? { error: () => {}, info: () => {}, debug: () => {}, warn: () => {} }
  : logger('api/routes/authRoutes');

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

    if (!validateEmail(email)) {
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

    const token = generateToken(user);
    log.info(`Successful login for user: ${email}`);
    return res.json({ user, token });

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

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      });
    }

    const result = await userService.createUser({ email, password, name });

    log.info(`User registered successfully: ${email}`);
    return res.status(201).json({
      user: result.user,
      token: result.token
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

router.post('/logout', authenticateWithToken, (req, res) => {
  // In the future, we might want to invalidate the token in Redis or similar
  res.json({ success: true });
});

router.get('/me', authenticateWithToken, (req, res) => {
  res.json(req.user);
});

export default router;