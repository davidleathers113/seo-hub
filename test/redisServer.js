const { createClient } = require('redis-mock');

let redisClient;

const startRedis = async () => {
  redisClient = createClient();
  await new Promise((resolve) => {
    redisClient.on('connect', resolve);
  });
  return redisClient;
};

const stopRedis = async () => {
  if (redisClient) {
    await new Promise((resolve) => {
      redisClient.quit(() => {
        redisClient = null;
        resolve();
      });
    });
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  startRedis,
  stopRedis,
  getRedisClient,
};