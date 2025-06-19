require('dotenv').config()
const express = require('express')
const app = express()
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const logger = require('./utils/logger')
const router = require('./routes/medis-routes')
const mongoose = require('mongoose')
const { notFound } = require('./middleware/notFound')
const { errorHandler } = require('./middleware/errorHandler')

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


app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    next()
  } else {
    express.json()(req, res, next);
  }
})

app.use('/api/v1/medias', sensitiveEndpointLimiter, router)

app.use(notFound)
app.use(errorHandler)

app.listen(process.env.PORT, () => {
  logger.info(`Server started on port ${process.env.PORT}`)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.info(`Unhandled Rejection at ${JSON.stringify(promise, null, 2)}, "reason": ${JSON.stringify(reason, null, 2)}`)
})