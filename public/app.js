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
    openQuantModal(count / 2)
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

  // Loop articles and display them
  const displayArticles = (articles) => {
    let newHtml = ''
    displayLoader(true)
    articles.map(article => {
      fixStrings(article)
      const cardHTML = createArticleCard(article)
      newHtml += cardHTML
    })
    displayLoader(false)
    articleDisplay.innerHTML = newHtml
    initTooltips()
    initSaveButtons()
    initUnsaveButtons()
    initCommentButtons()
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
            <div class="card-content">`
    if (article.saved) {
      cardHTML += `
              <a class="tooltipped comment-icon" data-id="${article._id}" data-tooltip="View Comments">
                <i class="fas fa-comment"></i>
              </a>
              <a class="tooltipped unfavorite-icon" data-id="${article._id}" data-tooltip="Unsave Article">
                <i class="fas fa-star"></i>
              </a>`
    } else {
      cardHTML += `
              <a class="tooltipped favorite-icon" data-id="${article._id}" data-tooltip="Save Article">
                <i class="fas fa-star"></i>
              </a>`
    }
    cardHTML += `
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

  const initSaveButtons = () => {
    const elems = document.getElementsByClassName('favorite-icon')
    Array.from(elems).forEach(function (elem) {
      elem.addEventListener('click', function (e) {
        const articleId = this.getAttribute('data-id')
        closeTooltip(this)
        saveArticle(articleId)
      })
    })
  }

  const initUnsaveButtons = () => {
    const elems = document.getElementsByClassName('unfavorite-icon')
    Array.from(elems).forEach(function (elem) {
      elem.addEventListener('click', function (e) {
        const articleId = this.getAttribute('data-id')
        closeTooltip(this)
        unsaveArticle(articleId)
      })
    })
  }

  const initCommentButtons = () => {
    const elems = document.getElementsByClassName('comment-icon')
    Array.from(elems).forEach(function (elem) {
      elem.addEventListener('click', function (e) {
        const articleId = this.getAttribute('data-id')
        console.log('got click')
        closeTooltip(this)
        getComments(articleId)
      })
    })
  }

  // Save an article
  const saveArticle = async (id) => {
    const fetchRes = await window.fetch(`/articles/save/${id}`, { method: 'POST' })
    const body = await fetchRes.json()
    displayArticles(body)
  }

  // Unsave an article
  const unsaveArticle = async (id) => {
    const fetchRes = await window.fetch(`/articles/unsave/${id}`, { method: 'POST' })
    const body = await fetchRes.json()
    displayArticles(body)
  }

  // Get comments from DB
  const getComments = async (id) => {
    const fetchRes = await window.fetch(`/articles/comments/${id}`)
    const body = await fetchRes.json()
    await setupCommentModal(body)
    openCommentModal(body)
  }

  const setupCommentModal = (body) => {
    document.getElementById('article-id').innerHTML = body._id
  }

  // Initialize tooltips on article render
  const initTooltips = () => {
    const options = {
      position: 'top'
    }
    const elems = document.querySelectorAll('.tooltipped')
    window.M.Tooltip.init(elems, options)
  }

  // Open modal with article comments
  const openCommentModal = (comments) => {
    const elem = document.getElementById('comment-modal')
    const instance = window.M.Modal.getInstance(elem)
    instance.open()
  }

  // Open modal that displays # of articles scraped
  const openQuantModal = (quantity) => {
    const elem = document.getElementById('quantity-modal')
    const instance = window.M.Modal.getInstance(elem)
    document.getElementById('article-quant').innerHTML = quantity
    instance.open()
  }

  // Prevent tooltips from staying on page on HTML render by closing them
  const closeTooltip = (elem) => {
    const instance = window.M.Tooltip.getInstance(elem)
    instance.close()
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

  document.getElementById('saved-articles').addEventListener('click', async () => {
    const fetchRes = await window.fetch('/articles/saved')
    const body = await fetchRes.json()
    if (body.length > 0) {
      displayArticles(body)
    } else {
      articleDisplay.innerHTML = `
      <div class="no-articles">
        <span>No saved articles found. Try saving an article first...</span>
      </div>
      <div class="center-align" style="margin: 1rem;">
        <a href="/" class="waves-efect waves-light btn red">Home</a>
      </div>`
    }
  })

  document.getElementById('save-comment').addEventListener('click', () => {
    const comment = document.getElementById('comment-textarea')
    document.getElementById('comments').innerHTML += `
      <div class="col s12 comment">
        <p style="display:inline;">${comment.value}</p>
        <a class="btn red delete-comment" style="float:right;">
          <i class="fas fa-trash-alt"></i>
        </a>
      </div>
    `
    document.getElementsByClassName('delete-comment').addEventListener('click', function () {

    })
    comment.value = ''
  })
})
