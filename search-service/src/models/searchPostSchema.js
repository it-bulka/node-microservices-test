const mongoose = require('mongoose')

const searchPostSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  }
}, { timestamps: true })

searchPostSchema.index({ content: "text" })
searchPostSchema.index({ createdAt: -1 })

const SearchPost = mongoose.models.SearchPost || mongoose.model('SearchPost', searchPostSchema)

module.exports = {
  SearchPost
}