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
const initRedis = (client) => {
  if (client) {
    redisClient = client;
  } else {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.connect();
  }
};

// Initialize default Redis client
initRedis();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      log.warn('Login attempt with missing credentials');
      return res.status(400).json({
        error: 'Validation failed',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    if (!validateEmail(email)) {
      log.warn(`Invalid email format attempted: ${email}`);
      return res.status(400).json({
        error: 'Validation failed',
        details: { email: 'Invalid email format' }
      });
    }

    // Authentication attempt
    const user = await UserService.authenticateWithPassword(email, password);

    if (!user) {
      log.info(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
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
        error: 'Validation failed',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { email: 'Invalid email format' }
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { password: passwordValidation.message }
      });
    }

    const result = await UserService.createUser({ email, password, ...otherFields });
    log.info(`User registered successfully: ${email}`);

    return res.status(201).json({
      user: result.user,
      token: result.token
    });

  } catch (error) {
    log.error('Registration error:', { error: error.message, stack: error.stack });

    // Handle specific error types
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'Email already registered'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during registration'
    });
  }
});

router.post('/logout', authenticateWithToken, async (req, res) => {
  console.log('\n=== Logout Process Start ===');
  const authHeader = req.get('Authorization');
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader) {
    console.log('Logout failed: No token provided');
    return res.status(400).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token.substring(0, 10) + '...');

  try {
    console.log('Verifying token...');
    const decoded = verifyToken(token);
    const expirationTime = decoded.exp - Math.floor(Date.now() / 1000);
    console.log('Token expiration time:', expirationTime, 'seconds');

    console.log('Adding token to blacklist...');
    await redisClient.set(`bl_${token}`, 'true', {
      EX: expirationTime > 0 ? expirationTime : 3600
    });
    console.log('Token blacklisted successfully');

    console.log('=== Logout Process Complete ===\n');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('=== Logout Process Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
});

router.get('/me', authenticateWithToken, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = {
  router,
  initRedis,
  registerUser: async (req, res) => {
    console.log('Registration attempt received:', req.body.email);
    try {
      const result = await UserService.createUser(req.body);
      console.log('User created successfully:', result.user.email);
      return res.status(201).json({
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Error during registration:', error.message);
      console.error('Full error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
};
