const jwt = require('jsonwebtoken');

// Mock authentication middleware for testing
const authenticateWithToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader || !authHeader.match(/^Bearer /i)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.id,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

module.exports = { authenticateWithToken, requireUser };
