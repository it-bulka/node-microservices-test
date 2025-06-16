const { REFRESH_TOKEN_TTL } = require('../consts/refreshToken')

const getTokenTTLForAllSource = (msTTL) => {
  const now = Date.now()
  const jwtTTL = msTTL / 1000
  const mongooseTTL = new Date(now + msTTL)

  return {
    jwtTokenTTL: jwtTTL,
    mongooseTokenTTL: mongooseTTL,
    cookieTokenMaxAge: msTTL
  }
}

exports.getRefreshTokenTTLForAllSource = () =>
  getTokenTTLForAllSource(REFRESH_TOKEN_TTL)

