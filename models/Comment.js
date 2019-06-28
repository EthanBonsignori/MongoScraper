const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 70
  }
})

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment
