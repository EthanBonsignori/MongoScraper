const axios = require('axios')
const cheerio = require('cheerio')

const db = require('../models')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.render('index')
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

  // POST articles to DB from scraper
  app.post('/articles', async (req, res) => {
    const articleCount = await getWorldArticles()
    res.status(201).json(articleCount)
  })

  // Change the saved status of article
  app.put('articles/:id', async (req, res) => {
    if (!req.params.id) req.status(400).json({ errorMessage: 'missing id' })
    if (!req.body.saved && typeof req.body.saved !== 'boolean') req.status(400).json({ errorMessage: 'missing saved status' })
    await db.Article.findByIdAndUpdate(req.params.id, { saved: req.body.saved })
    const dbArticles = await db.Article.find({})
    res.json(dbArticles).status(200)
  })

  // GET article from DB and populate comments
  app.get('/articles/:id', async (req, res) => {
    const id = req.params.id
    const dbArticle = await db.Article.findOne({ _id: id }).populate('comment')
    res.json(dbArticle).status(201)
  })

  // POST comment to article comments array
  app.post('/articles/:id', async (req, res) => {
    console.log(req.body.comment)
    const comment = req.body.comment
    const dbComment = await db.Comment.create({ body: comment })
    const id = req.params.id
    const dbArticle = await db.Article.update(
      { _id: id },
      { $push: { comments: dbComment._id } },
      { new: true })
    res.json(dbArticle).status(201)
  })

  // Scrape articles from NYTimes
  const getWorldArticles = async () => {
    const axiosRes = await axios.get('https://www.nytimes.com/section/world')
    const $ = cheerio.load(axiosRes.data)
    let articleCount = 0
    $('section #stream-panel div ol li div').each(function () {
      // Only create an obj if cheerio finds some text
      if ($(this).find('h2').text()) {
        let articleObj = {
          link: 'https://www.nytimes.com'
        }
        articleObj.link += $(this).find('a').attr('href') // Add the rest of the link
        articleObj.title = $(this).find('h2').text()
        articleObj.body = $(this).find('div a p').first().text()
        articleObj.author = $(this).find('div p span').text()
        articleObj.imageSrc = $(this).find('img').attr('src')

        // Push articles to db
        db.Article.create(articleObj).catch(err => {
          err = 'duplicate item'
          console.log(err)
        })
        console.log(articleCount)
        articleCount++
      }
    })
    return articleCount
  }
}
