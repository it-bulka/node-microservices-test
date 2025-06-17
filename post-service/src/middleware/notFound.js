const logger = require('../utils/logger')

exports.notFound = async (req, res) => {
  logger.warn('Hit not found route ', req.url, ' with method ', req.method)

  res.status(404).json({ success: false, message: 'Route Not Found' })
}