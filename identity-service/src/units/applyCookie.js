const { REFRESH_TOKEN_COOKIES_NAME } = require('../consts/refreshToken')

const attachCookiesToRes = ({ res, refreshToken, maxAge }) => {
  res.cookie(REFRESH_TOKEN_COOKIES_NAME, refreshToken, {
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: process.env.NODE_ENV === 'production'
  })
}

const clearCookies = (res) => {
  return res.cookie(REFRESH_TOKEN_COOKIES_NAME, '', { expires: new Date(Date.now())})
}

module.exports = {
  attachCookiesToRes,
  clearCookies
}