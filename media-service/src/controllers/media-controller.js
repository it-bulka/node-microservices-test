const logger =  require('../utils/logger')
const { uploadMediaToCloudinary } = require('../utils/cloudinary')
const { Media } = require('../models/mediaSchema')

const uploadMedia = async (req, res) => {
  logger.info(`Start uploading media`)

  if(!req.file) {
    logger.info(`File not found. Please add file and try again.`)
    return res.status(400).json({
      success: false,
      message: `File not found. Please add file and try again.`
    })
  }

  const { originalname, mimetype, buffer } = req.file
  const uploadedMedia = await uploadMediaToCloudinary(buffer)
  logger.info(`Cloudinary uploaded successfully. PublicId - ${uploadedMedia.public_id}`)

  const createdMedia = await Media.create({
    publicId: uploadedMedia.public_id,
    originalName: originalname,
    mimeType: mimetype,
    url: uploadedMedia.secure_url,
    userId: req.user.userId
  })

  return res.status(200).json({
    success: true,
    message: 'Media uploaded successfully.',
    publicId: createdMedia.publicId,
    url: uploadedMedia.secure_url
  })
}

const getAllMedias = async (req, res) => {
  try {
    const medias = await Media.find({})

    return res.status(200).json({
      success: true,
      medias
    })
  } catch (err) {
    logger.info(`Error fetching medias`, { err })

    return res.status(400).json({
      success: false,
      message: `Error fetching medias`
    })
  }
}

module.exports = {
  uploadMedia,
  getAllMedias
}