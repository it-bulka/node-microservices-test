const logger = require('../utils/logger');
const { Post } = require('../models/post')

const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const post = await Post.create({
      content: content,
      mediaIds: mediaIds || [],
      user: req.user.userId,
    })

    //TODO: add Redis later
    logger.info('Post successfully created')
    return res.status(201).json({
      success: true,
      message: 'Post successfully created',
      post
    })
  } catch (err) {
    logger.warn('Failed to create Post', { err });
    return res.status(400).send({
      success: false,
      message: 'Failed to create Post'
    })
  }
}

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page - 1) * limit

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)

    const totalPostsCount = await Post.countDocuments({})

    //TODO: Add Redis cache
    return res.status(200).json({
      success: true,
      posts: posts,
      totalPosts: totalPostsCount,
      totalPages: Math.ceil(totalPostsCount / limit),
      currentPage: page
    })
  } catch (err) {
    logger.warn('Failed to get all Posts', { err });
    return res.status(400).send({
      success: false,
      message: 'Failed to get all Posts'
    })
  }
}

const getPostById = async (req, res) => {
  try {
    //TODO: add Redis cache
    const postId = req.params.postId
    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    return res.status(200).json({
      success: true,
      post
    })
  } catch (err) {
    logger.warn('Failed to get Post', err);
    return res.status(400).send({
      success: false,
      message: 'Failed to get Post'
    })
  }
}

const deletePost = async (req, res) => {
  try {
    //TODO: add Redis cache
    const post = await Post.deleteOne({
      _id: req.params.id,
      user: req.user.userId
    })
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (err) {
    logger.warn('Failed to delete Post', err);
    return res.status(400).send({
      success: false,
      message: 'Failed to delete Post'
    })
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost
}