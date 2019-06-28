const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    required: true
  },
  imageSrc: {
    type: String
  },
  saved: {
    type: Boolean,
    default: false
  },
  comments: [{ type: Schema.ObjectId, ref: 'Comment' }]
})

const Article = mongoose.model('Article', ArticleSchema)

module.exports = Article
