// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const articleDisplay = document.getElementById('article-display')

  const displayLoader = (toggle) => {
    // Clear article display
    articleDisplay.innerHTML = ''
    // Add a loading bar if waiting on articles
    if (toggle) {
      articleDisplay.innerHTML = `
      <div class="progress" style="width: 20%; margin: 0 auto;">
        <div class="indeterminate"></div>
      </div>`
    }
  }

  const fetchArticles = async function () {
    const fetchRes = await window.fetch('/articles', {
      method: 'GET'
    })
    const body = await fetchRes.json()

    console.log(body)
    displayLoader(false)
    openModal(body.length)
    displayArticles(body)
  }

  const initializeArticles = async () => {
    await window.fetch('/articles', {
      method: 'POST'
    })
  }
  initializeArticles()

  const displayArticles = (articles) => {
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      fixStrings(article)
      const cardHTML = createArticleCard(article)
      articleDisplay.innerHTML += cardHTML
      initTooltips()
    }
  }

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
    // Adds 'By' to the front of author
    article.author = `By ${article.author}`
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
            <span style="color: grey; float: right;">${article.author}</span>
          </div>
        </div>
      </div>
    </div>`
    return cardHTML
  }

  const initTooltips = () => {
    const options = {
      position: 'top'
    }
    const elems = document.querySelectorAll('.tooltipped')
    window.M.Tooltip.init(elems, options)
  }

  const initModals = () => {
    const elems = document.querySelectorAll('.modal')
    window.M.Modal.init(elems, null)
  }
  initModals()

  const openModal = (quantity) => {
    const elem = document.getElementById('quantity-modal')
    const instance = window.M.Modal.getInstance(elem)
    document.getElementById('article-quant').innerHTML = quantity
    instance.open()
  }

  document.getElementById('scrape-ny').addEventListener('click', () => {
    displayLoader(true)
    fetchArticles()
  })
})
