require('dotenv').config()
const express = require('express');
const app = express();
const logger = require('./utils/logger')
const { notFound } = require('./middleware/notFound')
const { errorHandler } = require('./middleware/errorHandler')
const router = require('./routes/post-routes')

const mongoose = require("mongoose")
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const redis = require('./utils/redisClient')
const { connectRabbitMQ } = require('./utils/rabbitmq')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB Connected'))
  .catch((err) => console.info(`MongoDB connection error`, err))

// IP base rate limiter for sensitive endpoints
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    res.statusCode(429).json({ success: false, message: 'Too many requests' });
  }
})

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use(
  '/api/v1/posts',
  sensitiveEndpointLimiter,
  (req, res, next) => {
    req.redisClient = redis
    next()
  },
  router
)

app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectRabbitMQ()
    app.listen(process.env.PORT, () => {
      logger.info(`Post Server started on port ${process.env.PORT}`);
    })
  } catch (err) {
    logger.error(`Failed to connect to server`)
    process.exit(1)
  }
}

startServer()

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}, "reason": ${reason}`)
})