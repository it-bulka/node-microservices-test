const express = require('express');
const router = express.Router();
const { authenticateRequest } = require('../middleware/authenticateRequest');
const {
  createPost,
  getAllPosts,
  getPostById,
  deletePost
} = require('../controllers/post-controller')

router.use(authenticateRequest);

router.post('/create', createPost);
router.get('/all-posts', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);

module.exports = router;