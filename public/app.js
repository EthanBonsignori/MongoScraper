// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const articleDisplay = document.getElementById('article-display')

  // Displays a loading bar while scraping / retrieving from the DB
  const displayLoader = (toggle) => {
    // Clear article display
    articleDisplay.innerHTML = ''
    // Add a loading bar if waiting on articles
    if (toggle) {
      articleDisplay.innerHTML = `
      <div class="progress red lighten-4" style="width: 20%; margin: 3rem auto;">
        <div class="indeterminate red"></div>
      </div>`
    }
  }

  const displayNoArticles = () => {
    articleDisplay.innerHTML = `
      <div class="no-articles">
        <span>No articles found...</span>
      </div>
      <div class="center-align" style="margin: 1rem;">
        <a class="waves-efect waves-light btn red" id="scrape">Get Articles</a>
      </div>`
    // Click listener for scrape button
    document.getElementById('scrape').addEventListener('click', async (e) => {
      displayLoader(true)
      await postArticles()
      getArticlesFromDb()
    })
  }

  // Scrape route
  const postArticles = async () => {
    const fetchRes = await window.fetch('/articles', {
      method: 'POST'
    })
    const count = await fetchRes.json()
    openModal(count / 2)
  }

  // Get articles from the DB
  const getArticlesFromDb = async function () {
    const fetchRes = await window.fetch('/articles', {
      method: 'GET'
    })
    const body = await fetchRes.json()
    // If articles are returned, display them
    if (body.length > 1) {
      displayLoader(false)
      displayArticles(body)
    } else {
      displayNoArticles()
    }
  }
  getArticlesFromDb()

  // Open modal with # of articles
  const openModal = (quantity) => {
    const elem = document.getElementById('quantity-modal')
    const instance = window.M.Modal.getInstance(elem)
    document.getElementById('article-quant').innerHTML = quantity
    instance.open()
  }

  // Loop articles and display them
  const displayArticles = (articles) => {
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      fixStrings(article)
      const cardHTML = createArticleCard(article)
      articleDisplay.innerHTML += cardHTML
      initTooltips()
    }
  }

  // Helper to fix strings
  const fixStrings = (article) => {
    // Limits length so it fits in 3 lines on the card
    const maxLength = 250
    if (article.body.length > maxLength) {
      article.body = article.body.slice(0, maxLength - 3) + '...'
    }
    // Removes extra 'and' if it exists
    if (article.author.endsWith(' and ')) {
      article.author = article.author.slice(0, -5)
    }
    // Replace 'AND' with '&'
    article.author = article.author.toUpperCase()
    article.author = article.author.replace(' AND ', ' & ')
  }

  // Creates Card HTML for each article
  const createArticleCard = (article) => {
    let cardHTML = `
      <div class="col s12 m6 l6">
        <div class="card horizontal">`
    // Only add image to article card if one exists
    if (article.imageSrc) {
      cardHTML += `
          <div class="card-image">
            <img src="${article.imageSrc}">
          </div>`
    }
    cardHTML += `
          <div class="card-stacked">
            <div class="card-content">
              <a class="tooltipped favorite-icon" data-tooltip="Save Article">
                <i class="fas fa-star"></i>
              </a>
              <p class="article-title">${article.title}</p>
              <p>${article.body}</p>
            </div>
            <div class="card-action">
              <a href="${article.link}" target="_blank">View on nytimes.com</a>
              <span style="color: grey; float: right;">By ${article.author}</span>
            </div>
          </div>
        </div>
      </div>`
    return cardHTML
  }

  // Initialize tooltips on article render
  const initTooltips = () => {
    const options = {
      position: 'top'
    }
    const elems = document.querySelectorAll('.tooltipped')
    window.M.Tooltip.init(elems, options)
  }

  // Initialize modals
  const initModals = () => {
    const options = {
      endingTop: '50%'
    }
    const elems = document.querySelectorAll('.modal')
    window.M.Modal.init(elems, options)
  }
  initModals()
})
