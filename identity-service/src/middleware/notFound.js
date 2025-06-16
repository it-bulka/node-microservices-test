const logger = require('../units/logger')

exports.notFound = async (req, res) => {
  logger.warn('Hit not found route ', req.originalUrl, ' with method ', req.method)
  res.status(404).json({ success: false, message: 'Route Not Found' })
}