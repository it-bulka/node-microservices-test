const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  refreshToken,
  logout
} = require('../controllers/identity-controller')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/refresh-token', refreshToken)
router.get('/logout', logout)

module.exports = router