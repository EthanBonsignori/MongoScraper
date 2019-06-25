const express = require('express')
const mongoose = require('mongoose')
const logger = require('morgan')

// Loads all models
const db = require('./models')

const PORT = 3000

const app = express()

// Middleware
app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

// Routes
require('./routes/routes')(app)

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines'

mongoose.connect(MONGODB_URI)

// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
