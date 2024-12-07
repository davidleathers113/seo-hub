const { verifyToken } = require('../../utils/jwt');
const UserService = require('../../services/user');

const authenticateWithToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader || !authHeader.match(/^Bearer /i)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await UserService.get(decoded.id);

    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    console.error('Error stack:', error.stack);
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