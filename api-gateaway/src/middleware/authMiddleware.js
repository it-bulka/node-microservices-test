const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if(!token) {
    logger.error('Access attempt without token')
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, payload) => {
    if(err) {
      logger.error('Invalid token', { err })
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
    }

    req.user = payload
    next()
  })
}

module.exports = {
  authMiddleware
}