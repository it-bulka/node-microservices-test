const logger = require('../utils/logger')

exports.errorHandler = (err, req, res, next) => {
  logger.error(err.stack)

  res.status(err.status || 400).json({
    message: err.message || 'Internal Server Error',
  })
}

