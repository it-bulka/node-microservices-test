require('dotenv').config()
const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const Redis = require('ioredis')
const { RateLimiterMemory } = require("rate-limiter-flexible")

const logger = require('./units/logger')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const { errorHandler } = require('./middleware/errorHandler')
const { notFound } = require('./middleware/notFound')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB Connected'))
  .catch((err) => console.info(`MongoDB connection error`, err))

const redisClient = new Redis()

// DDos protection and rate limiter
const rateLimiter = new RateLimiterMemory({
  storeClient: redisClient,
  key: 'middleware',
  points: 10,
  duration: 1
})

// IP base rate limiter for sensitive endpoints
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    res.status(429).json({ success: false, message: 'Too many requests' });
  },
  store: new RedisStore({
    sendCommand: (command, ...args) =>
      redisClient.send_command(command, ...args),
  }),
})

app.use(helmet());
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
      return res.status(429).json({ success: false, message: 'Too many requests' });
    })
})

app.get('/', (req, res) => {
  return res.status(200).json({ success: true });
})

router.use('/auth/register', sensitiveEndpointLimiter)
router.use('/auth', authRoutes)
app.use("/api/v1", router)

app.use(notFound)
app.use(errorHandler)

app.listen(process.env.PORT, () => {
  logger.info(`Listening on port ${process.env.PORT}`)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.info(`Unhandled Rejection at ${promise}, "reason": ${reason}`);
})