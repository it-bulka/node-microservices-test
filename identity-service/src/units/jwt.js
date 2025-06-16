const jwt = require('jsonwebtoken')
const { RefreshToken } = require('../models/RefreshToken')
const { getRefreshTokenTTLForAllSource } = require("./getTokenTTLForAllSource");
const { attachCookiesToRes } = require("./applyCookie");

const generateTokens = async (user, { refreshExpiresIn, dbExpiresAt }) => {
  const userData = {
    userId: user._id,
    username: user.username,
  }

  const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, { expiresIn: '60m' })
  const refreshToken = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiresIn })

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: dbExpiresAt,
  })

  return { accessToken, refreshToken }
}


const applyTokens = async ({ res, user }) => {
  const {
    jwtTokenTTL,
    mongooseTokenTTL,
    cookieTokenMaxAge
  } = getRefreshTokenTTLForAllSource()

  const { accessToken, refreshToken } = await generateTokens(user, {
    refreshExpiresIn: jwtTokenTTL,
    dbExpiresAt: mongooseTokenTTL
  })
  await attachCookiesToRes({res, refreshToken, maxAge: cookieTokenMaxAge })

  return { accessToken, refreshToken }
}

const verifyRefreshToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return payload
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return undefined
    } else {
      throw new Error(err.message)
    }
  }
}

module.exports = {
  generateTokens: jwt,
  applyTokens,
  verifyRefreshToken
}