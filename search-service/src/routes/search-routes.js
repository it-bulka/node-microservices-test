const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/authenticate')
const { searchPostController } = require('../controllers/searchPostController')

router.use(authenticate)
router.get('/posts', searchPostController)

module.exports = router