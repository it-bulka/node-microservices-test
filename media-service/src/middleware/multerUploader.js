const multer = require('multer')
const logger = require("../utils/logger");

const upload = multer({
  storage: multer.memoryStorage (),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).single('file')

const multerUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error('Multer Error while uploading', { err })

      return res.status(400).json({
        success: false,
        message: `Multer Error while uploading`,
        error: err,
        stack: err.stack,
      })
    } else if (err){
      logger.error('Unknown Error while uploading', { err })

      return res.status(400).json({
        success: false,
        message: `Unknown Error while uploading`,
        error: err,
        stack: err.stack,
      })
    }

    console.log('multer', req.file)

    if(!req.file){
      logger.error('No file found')

      return res.status(400).json({
        success: false,
        message: `No file found`
      })
    }

    next()
  })
}

module.exports = { multerUpload }