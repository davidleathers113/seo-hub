const UserService = require('../../services/user');
const express = require('express');
const { verifyToken, generateToken } = require('../../utils/jwt');

// Create a mock router
const router = express.Router();

// Mock authentication middleware for testing
const authenticateWithToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await UserService.get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const initRedis = (client) => {
  // No-op for tests
};

// Add mock routes
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  try {
    const user = await UserService.authenticateWithPassword(email, password);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  try {
    const result = await UserService.createUser(req.body);
    const token = generateToken(result.user);
    res.status(201).json({
      user: result.user,
      token
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', authenticateWithToken, (req, res) => {
  res.json({ success: true });
});

router.get('/me', authenticateWithToken, (req, res) => {
  res.json(req.user);
});

module.exports = {
  authenticateWithToken,
  requireUser,
  initRedis,
  router
};
