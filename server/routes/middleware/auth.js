const { verifyToken } = require('../../utils/jwt');
const UserService = require('../../services/user');

const authenticateWithToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log('Auth header:', authHeader);

  if (!authHeader || !authHeader.match(/^Bearer /i)) {
    console.log('No Bearer token found');
    return next();
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token);

  try {
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);

    const user = await UserService.get(decoded.id);
    console.log('Found user:', user ? 'yes' : 'no');

    if (user) {
      req.user = user;
      console.log('User authenticated successfully');
    }
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Authentication required' });
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

module.exports = { authenticateWithToken, requireUser };
