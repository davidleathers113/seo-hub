const express = require('express');
const UserService = require('../services/user.js');
const { generateToken } = require('../utils/jwt.js');
const logger = require('../utils/log.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();
const log = logger('api/routes/authRoutes');

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

router.post('/register', async (req, res, next) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  try {
    const user = await UserService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    log.error('Error while registering user', error);
    return res.status(400).json({ error });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.all('/api/auth/logout', async (req, res) => {
  if (req.user) {
    await UserService.regenerateToken(req.user);
  }
  return res.status(204).send();
});

router.get('/me', requireUser, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;