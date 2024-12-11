const { createClient } = require('redis');
const { verifyToken } = require('../../utils/jwt');
const { logger } = require('../../utils/log');

const log = logger('auth-middleware');

let redisClient;

const initRedis = async (client) => {
  if (client) {
    redisClient = client;
    return client;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('connect', () => log.info('Redis connected successfully'));
    redisClient.on('error', (err) => log.error('Redis Client Error:', err));

    try {
      await redisClient.connect();
    } catch (error) {
      log.error('Redis connection failed:', error);
      throw error;
    }
  }

  return redisClient;
};

const authenticateWithToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Check if token is blacklisted
    const client = await initRedis();
    const isBlacklisted = await client.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    log.error('Authentication failed:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token verification failed' });
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

module.exports = {
  authenticateWithToken,
  requireUser,
  initRedis
};
