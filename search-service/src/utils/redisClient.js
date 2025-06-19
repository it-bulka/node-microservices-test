const Redis = require('ioredis')
const logger = require('./logger')

const redis = new Redis()

redis.on('connect', () => {
  logger.info('Redis connected!')
})

redis.on('error', (err) => {
  logger.info('Redis error.', { error: err})
})

module.exports = redis

