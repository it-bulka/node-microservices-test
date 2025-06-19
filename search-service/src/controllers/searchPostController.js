const logger = require('../utils/logger')
const { SearchPost } = require('../models/searchPostSchema')

const searchPostController = async (req, res) => {
  logger.info('Hit search post endpoint')
  try {
    const { query } = req.query

    const result = await SearchPost.find(
      { $text: { $search: query }},
      { score: { $meta: 'textScore'}}
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(1)

    return res.status(200).json({
      success: true,
      message: 'Search posts successfully',
      data: result
    })
  } catch (err) {
    logger.error(`Error while searching post`, { err })
    return res.status(404).json({
      success: false,
      message: 'Error while searching post',
    })
  }
}

module.exports = { searchPostController }