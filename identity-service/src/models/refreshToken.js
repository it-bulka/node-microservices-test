const mongoose = require('mongoose')

const RefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
}, { timestamps: true })

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema)
module.exports = { RefreshToken }