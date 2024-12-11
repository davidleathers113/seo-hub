const { stopRedis } = require('./redisServer');

module.exports = async () => {
  // Stop Redis server
  await stopRedis();

  // Clean up other global test requirements here
};