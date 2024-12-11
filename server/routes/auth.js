const express = require('express');
const UserService = require('../services/user.js');
const { generateToken, verifyToken } = require('../utils/jwt.js');
const { authenticateWithToken } = require('./middleware/auth.js');
const redis = require('redis');
const { validateEmail, validatePassword } = require('../utils/validation.js');

const router = express.Router();

// Initialize logger based on environment
const log = process.env.NODE_ENV === 'test' 
  ? { error: () => {}, info: () => {}, debug: () => {}, warn: () => {} }
  : require('../utils/log.js').logger('api/routes/authRoutes');

// Initialize Redis client
let redisClient;

// Function to initialize Redis client
const initRedis = async (client) => {
  if (client) {
    redisClient = client;
    return client;
  }

  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => log.error('Redis Client Error:', err));

    try {
      await redisClient.connect();
      log.info('Redis connected successfully');
    } catch (err) {
      log.error('Redis connection failed:', err);
      throw err;
    }
  }

  return redisClient;
};

// Initialize default Redis client
initRedis().catch(err => log.error('Initial Redis connection failed:', err));

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
    const user = await UserService.authenticateWithPassword(email, password);

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
    log.error('Login error:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login'
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, ...otherFields } = req.body;

    // Validation
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: passwordValidation.message
      });
    }

    const result = await UserService.createUser({ email, password, ...otherFields });
    log.info(`User registered successfully: ${email}`);

    const token = generateToken(result);
    return res.status(201).json({
      user: result,
      token
    });

  } catch (error) {
    log.error('Registration error:', { error: error.message, stack: error.stack });

    // Handle specific error types
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during registration'
    });
  }
});

router.post('/logout', authenticateWithToken, async (req, res) => {
  log.info('=== Logout Process Start ===');
  const authHeader = req.get('Authorization');
  log.debug('Auth header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader) {
    log.warn('Logout failed: No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  log.debug('Token extracted:', token.substring(0, 10) + '...');

  try {
    log.debug('Verifying token...');
    const decoded = verifyToken(token);
    const expirationTime = decoded.exp - Math.floor(Date.now() / 1000);
    log.debug('Token expiration time:', expirationTime, 'seconds');

    log.debug('Adding token to blacklist...');
    await redisClient.set(`bl_${token}`, 'true', {
      EX: expirationTime > 0 ? expirationTime : 3600
    });
    log.info('Token blacklisted successfully');

    log.info('=== Logout Process Complete ===');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    log.error('=== Logout Process Error ===');
    log.error('Error details:', {
      type: error.constructor.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error during logout' });
  }
});

router.get('/me', authenticateWithToken, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = {
  router,
  initRedis
};
