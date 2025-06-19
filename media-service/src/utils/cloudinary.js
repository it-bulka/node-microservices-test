const cloudinary = require('cloudinary').v2
const logger = require('./logger')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadMediaToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER,
        resource_type: 'auto'
      },
      (err, result) => {
        if (err) {
          logger.info(`Error uploading media to cloudinary`, { err })
          reject(err)
        } else {
          resolve(result)
        }
      })

    uploadStream.end(fileBuffer)
  })
}

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    logger.info(`Media ${publicId} deleted successfully from cloudinary`)
    return result
  } catch (err) {
    logger.error(`Error deleting media ${publicId} from cloudinary: ${err}`)
    throw err
  }
}

module.exports = {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary
}