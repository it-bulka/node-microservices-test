const express = require('express');
const app = express();
const logger = require('./utils/logger')

app.listen(process.env.PORT, () => {
  logger.info(`Post Server started on port ${process.env.PORT}`);
})

process.on('unhandledRejection', (reason, promise) => {
  logger.info(`Unhandled Rejection at ${promise}, "reason": ${reason}`);
})