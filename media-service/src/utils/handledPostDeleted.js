const { Media } = require('../models/mediaSchema')
const { deleteMediaFromCloudinary } = require('./cloudinary')
const logger = require("./logger")

const handledPostDeleted = async (event) => {
  console.log('handledPostDeleted', event)
  const { postId, mediaIds } = event

  try {
    const mediasToDelete = await Media.find({ publicId: { $in: mediaIds } })

    for (const media of mediasToDelete) {
      await deleteMediaFromCloudinary(media.publicId)
      await Media.findByIdAndDelete(media._id)

      logger.info(`Deleted media ${media.id} associated with deleted post ${postId}`)
    }

    logger.info(`Processed deletion medias for post with id ${postId}`)
  } catch (err) {
    logger.error(`Error while deleting medias for post with id ${postId}. \nError: ${err.message}`)
    throw err
  }

}

module.exports = { handledPostDeleted }