const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/authenticate')
const { multerUpload } = require('../middleware/multerUploader')

const {
  uploadMedia,
  getAllMedias
} = require('../controllers/media-controller')

router.post('/upload', authenticate, multerUpload, uploadMedia)
router.get('/all', authenticate, getAllMedias)

module.exports = router