// Scraping tools
const axios = require('axios')
const cheerio = require('cheerio')

// Load all models
const db = require('../models')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.render('index')
  })

  // GET articles from DB
  app.get('/articles', async (req, res) => {
    const dbArticle = await getArticlesFromDb()
    res.json(dbArticle).status(201)
  })

  // GET saved articles from DB
  app.get('/articles/saved', async (req, res) => {
    const savedDbArticles = await db.Article.find({ saved: true }).populate('comment')
    res.json(savedDbArticles).status(201)
  })

  // POST articles to DB from scraper
  app.post('/articles', async (req, res) => {
    const articleCount = await getWorldArticles()
    res.json(articleCount).status(201)
  })

  // POST one article to DB, return all articles to re-render
  app.post('/articles/save/:id', async (req, res) => {
    const id = req.params.id
    await db.Article.findByIdAndUpdate(id, { saved: true })
    const dbArticles = await getArticlesFromDb()
    res.json(dbArticles).status(201)
  })

  // POST one article to DB, return all articles to re-render
  app.post('/articles/unsave/:id', async (req, res) => {
    const id = req.params.id
    await db.Article.findByIdAndUpdate(id, { saved: false })
    const dbArticles = await getArticlesFromDb()
    res.json(dbArticles).status(201)
  })

  app.post('/articles/comments/:id', async (req, res) => {
    const dbComment = await db.Comment.create(req.body)
    const id = req.params.id
    const dbArticle = await db.Article.findOneAndUpdate({ _id: id }, { note: dbComment._id }, { new: true })
    res.json(dbArticle).status(201)
  })

  // Return all articles from DB
  const getArticlesFromDb = () => {
    return db.Article.find({})
  }

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
