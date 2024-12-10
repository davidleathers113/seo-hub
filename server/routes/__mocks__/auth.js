const UserService = require('../../services/user');

// Mock authentication middleware for testing
const authenticateWithToken = async (req, res, next) => {
  const testUserId = req.get('x-test-user-id');
  
  if (!testUserId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await UserService.get(testUserId);
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

module.exports = {
  authenticateWithToken,
  requireUser,
  initRedis
};
