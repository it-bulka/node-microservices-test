const logger = require('../utils/logger')

const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id']

  if(!userId) {
    logger.info('Access attempt without user ID')

    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }

  req.user = { userId }
  next()
}

module.exports = { authenticate }