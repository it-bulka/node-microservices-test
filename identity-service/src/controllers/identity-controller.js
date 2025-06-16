const logger = require('../units/logger')
const {
  validateRegistration,
  validateLogin
} = require('../units/validate')
const { User } = require('../models/user')
const { applyTokens, verifyRefreshToken } = require('../units/jwt')
const { clearCookies } = require('../units/applyCookie')
const { RefreshToken } = require("../models/refreshToken");

const registerUser = async (req, res) => {
  logger.info('Registration endpoint hit')

  try {
    const { error } = validateRegistration(req.body)
    if (error) {
      logger.warn('Validation error', error.details[0].message)

      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }

    const { email, username, password } = req.body
    let user = await User.findOne(
      { $or: [ { email },{ username } ]}
    )
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }

    user = new User({ email, username, password })
    await user.save()

    logger.info('User saved successfully', user._id)

    const { accessToken } = await applyTokens({ res, user })

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken
    })
  } catch (err) {
    logger.warn('REGISTER ERROR', err)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

const loginUser = async (req, res) => {
  logger.info('Login endpoint hit')
  try {
    const { error } = validateLogin(req.body)
    if (error) {
      logger.warn('Validation error', error.details[0].message)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({
      email
    })
    if(!user) {
      logger.warn(`User with email ${email} does not exist`)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const { accessToken } = await applyTokens({ res, user })

    logger.info('Login successfully with email:', email)
    return res.status(200).json({
      success: true,
      message: 'User login successfully',
      accessToken
    })

  } catch (err) {
    logger.warn('LOGIN ERROR', err)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.signedCookies || req.cookies
    if (!refreshToken) {
      logger.warn('Refresh token is missing')
      return res.status(401).json({
        success: false,
        message: 'Refresh token is missing',
      })
    }

    const userFromToken = verifyRefreshToken(refreshToken)
    if (!userFromToken) {
      logger.warn('Invalid or expired token')
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken })
    if (!storedToken || storedToken?.expiresAt < Date.now()) {
      logger.warn('Invalid or expired token')
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    const user = await User.findById(userFromToken.userId)
    if (!user || storedToken.user !== userFromToken.userId) {
      logger.warn('Invalid token')
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    const { accessToken } = await applyTokens({ res, user })

    await RefreshToken.deleteOne({ token: refreshToken })
    logger.info('Refresh token successfully with email:', email)
    return res.status(200).json({
      success: true,
      message: 'User login successfully',
      accessToken
    })
  } catch (err) {
    logger.warn('REFRESH TOKEN ERROR', err)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

const logout = async (req, res) => {
  try {
    await RefreshToken.deleteOne({ token: req.cookies || req.signedCookies })
    await clearCookies(res)

    logger.info('Logout successfully', err)
    return res.status(200).json({
      success: true,
      message: 'Logout successfully',
    })
  } catch (err) {
    logger.warn('LOGOUT ERROR', err)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logout
}