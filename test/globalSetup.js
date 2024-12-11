const { startRedis, stopRedis } = require('./redisServer');

module.exports = async () => {
  // Start Redis server
  await startRedis();

  // Set up other global test requirements here
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
};