const mongoose = require('mongoose')
const argon2 = require('argon2')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

UserSchema.pre('save', async function (next) {
  if(this.isModified('password')) {
    try {
      this.password = await argon2.hash(this.password)
    } catch (error) {
      return next(error)
    }
  }

  next()
})

UserSchema.methods.comparePassword = async function (password) {
  try {
    return argon2.verify(this.password, password)
  } catch (err) {
    throw err
  }
}
const User = mongoose.model('User', UserSchema)

module.exports = {
  User
}