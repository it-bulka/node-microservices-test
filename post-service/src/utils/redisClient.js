const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis();

redis.on('connect', () => {
  logger.info('✅ Redis connected!');
});

redis.on('error', (err) => {
  logger.error('❌ Redis error:', { err });
});

module.exports = redis;