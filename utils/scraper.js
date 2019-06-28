const axios = require('axios')
const cheerio = require('cheerio')

const Article = require('../models/Article')

// Scrape articles from NYTimes
const scrape = async () => {
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
      Article.create(articleObj).catch(err => {
        console.error(err)
      })
      articleCount++
    }
  })
  return articleCount
}

module.exports = scrape
