const { verifyToken } = require('../../utils/jwt');
const UserService = require('../../services/user');
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => console.log('Redis connected successfully'));
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().catch(console.error);

const authenticateWithToken = async (req, res, next) => {
  console.log('\n=== Token Authentication Start ===');
  const authHeader = req.get('Authorization');
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.match(/^Bearer /i)) {
    console.log('Authentication failed: No valid auth header');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token.substring(0, 10) + '...');

  try {
    console.log('Checking Redis connection status:', redisClient.isReady ? 'Connected' : 'Not connected');
    console.log('Checking token in blacklist...');
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    console.log('Token blacklist status:', isBlacklisted ? 'Blacklisted' : 'Not blacklisted');

    if (isBlacklisted) {
      console.log('Authentication failed: Token is blacklisted');
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    const decoded = verifyToken(token);
    console.log('Token decoded successfully for user:', decoded.email);

    const user = await UserService.get(decoded.id);
    console.log('User found:', user ? 'Yes' : 'No');

    if (user) {
      req.user = user;
      console.log('=== Token Authentication Success ===\n');
      next();
    } else {
      console.log('Authentication failed: User not found');
      res.status(401).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('=== Token Authentication Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
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
