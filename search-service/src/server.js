require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const searchRoutes = require('./routes/search-routes')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB Connected'))
  .catch(err => logger.error(`MongoDB connection error`, err))

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/v1/search', searchRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.info(`Unhandled Rejection at ${JSON.stringify(promise, null, 2)}, "reason": ${JSON.stringify(reason, null, 2)}`)
})