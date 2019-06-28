const db = require('../models')
const scrape = require('../utils/scraper')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.render('index')
  })

  // POST articles to DB from scraper
  app.post('/articles', async (req, res) => {
    const articleCount = await scrape()
    res.status(201).json(articleCount)
  })

  // GET articles from DB
  app.get('/articles', async (req, res) => {
    if (req.query.saved && req.query.saved.toLowerCase() === 'true') {
      const savedDbArticles = await db.Article.find({ saved: true }).populate('comments')
      return res.status(200).json(savedDbArticles)
    }
    const dbArticle = await db.Article.find({})
    res.status(200).json(dbArticle)
  })

  // GET one article from DB and populate comments
  app.get('/articles/:id', async (req, res) => {
    const dbArticle = await db.Article.findOne({ _id: req.params.id }).populate('comments')
    res.json(dbArticle).status(201)
  })

  // Change the saved status of article
  app.put('/articles/:id', async (req, res) => {
    if (!req.params.id) req.status(400).json({ errorMessage: 'missing id' })
    if (!req.body.saved && typeof req.body.saved !== 'boolean') req.status(400).json({ errorMessage: 'missing saved status' })
    await db.Article.findByIdAndUpdate(req.params.id, { saved: req.body.saved })
    const dbArticles = await db.Article.find({})
    res.json(dbArticles).status(200)
  })

  // POST comment to article comments array
  app.post('/articles/:id', async (req, res) => {
    const dbComment = await db.Comment.create({ body: req.body.comment })
    await db.Article.updateOne({ _id: req.params.id }, { $push: { comments: dbComment._id } })
    const dbArticle = await db.Article.findById(req.params.id)
    res.json(dbArticle).status(200)
  })
}
