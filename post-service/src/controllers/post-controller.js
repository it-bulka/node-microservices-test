const logger = require('../utils/logger');
const { Post } = require('../models/post')
const { invalidatePostCache } = require('../utils/invalidatePostCache')
const mongoose = require('mongoose')
const { publishEvent } = require('../utils/rabbitmq')

const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const post = await Post.create({
      content: content,
      mediaIds: mediaIds || [],
      user: req.user.userId,
    })

    await invalidatePostCache(req, post._id.toString())

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

    const cacheKey = `posts:${page}:${limit}`
    const cachedPosts = await req.redisClient.get(cacheKey)
    if(cachedPosts) {
      return res.status(200).json(JSON.parse(cachedPosts))
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)

    const totalPostsCount = await Post.countDocuments({})
    const result = {
      success: true,
      posts: posts,
      totalPosts: totalPostsCount,
      totalPages: Math.ceil(totalPostsCount / limit),
      currentPage: page
    }

    await req.redisClient.setex(cacheKey, 600, JSON.stringify(result))
    return res.status(200).json(result)

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
    const postId = req.params.id
    const cacheKey = `posts:${postId}`
    const cachedPost = await req.redisClient.get(cacheKey)
    if(cachedPost) {
      return res.status(200).json({
        success: true,
        post: JSON.parse(cachedPost)
      })
    }

    const post = await Post.findOne({ _id: new mongoose.Types.ObjectId(postId) })

    if (!post) {
      logger.info(`Post ${postId} not found`)
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    await req.redisClient.setex(cacheKey, 600, JSON.stringify(post))
    return res.status(200).json({
      success: true,
      post
    })
  } catch (err) {
    logger.warn('Failed to get Post', { err });
    return res.status(400).send({
      success: false,
      message: 'Failed to get Post'
    })
  }
}

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }
    console.log('deleted post', post)
    await publishEvent('post.deleted', {
      postId: post._id,
      userId: post.user,
      mediaIds: post.mediaIds
    })
    await invalidatePostCache(req, req.params.id)

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