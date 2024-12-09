const express = require('express');
const UserService = require('../services/user.js');
const { generateToken, verifyToken } = require('../utils/jwt.js');
const logger = require('../utils/log.js');
const { authenticateWithToken } = require('./middleware/auth.js');
const redis = require('redis');

const router = express.Router();
const log = logger('api/routes/authRoutes');

// Initialize Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ error: msg });
  const { email, password } = req.body;

  console.log('Login request received for email:', email);

  if (!email || !password) {
    console.log('Missing email or password in request');
    return sendError('Email and password are required');
  }

  try {
    console.log('Attempting to authenticate user...');
    const user = await UserService.authenticateWithPassword(email, password);
    console.log('Authentication result:', user ? 'success' : 'failed');

    if (user) {
      console.log('Generating token for user...');
      const token = generateToken(user);
      return res.json({ user, token });
    } else {
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error('Full login error:', error);
    console.error('Error stack:', error.stack);
    log.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  console.log('Registration attempt received:', req.body.email);
  try {
    const result = await UserService.createUser(req.body);
    console.log('User registration successful:', result.user.email);
    return res.status(201).json({
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    console.error('Full error:', error);
    return res.status(400).json({ error: error.message });
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
