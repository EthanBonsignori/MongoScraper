// Scraping tools
const axios = require('axios')
const cheerio = require('cheerio')

// Load all models
const db = require('../models')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.render('index')
  })

  // app.get('/article/:id', async (req, res) => {

  // })

  app.post('/articles', async (req, res) => {
    getWorldArticles()
    res.status(201)
  })

  app.get('/articles', async (req, res) => {
    const dbArticle = await db.Article.find({})
    res.json(dbArticle)
  })

  const getWorldArticles = async () => {
    const axiosRes = await axios.get('https://www.nytimes.com/section/world')
    const $ = cheerio.load(axiosRes.data)

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
          console.error(err)
        })
      }
    })
  }
}
