// Scraping tools
const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.render('index')
  })

  app.get('/scrape', async function (req, res) {
    console.log('scraping...')
    await getWorldArticles()
    res.redirect('/')
  })

  const getWorldArticles = async function () {
    await axios.get('https://www.nytimes.com/section/world').then(response => {
      const $ = cheerio.load(response.data)

      $('section #stream-panel div ol li div').each(function () {
        // Only create an obj if cheerio finds some text
        if ($(this).find('h2').text()) {
          let articleObj = {
            link: 'https://www.nytimes.com'
          }
          articleObj.link += $(this).find('a').attr('href') // Add the rest of the link
          articleObj.title = $(this).find('h2').text()
          articleObj.body = $(this).find('p').text()
          articleObj.author = $(this).find('div p span').text()
          articleObj.imageSrc = $(this).find('img').attr('src')

          console.log(articleObj)
        }
      })
    })
  }
}
