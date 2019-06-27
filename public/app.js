// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const articleDisplay = document.getElementById('article-display')
  const comments = document.getElementById('comments')
  // Controls whether or not to display all articles or just saved ones
  let onSavedPage = false

  // Displays a loading bar while scraping / retrieving from the DB || retrieving comments from DB
  const displayLoader = (toggle, inComments) => {
    // Clear article display
    if (!inComments) {
      articleDisplay.innerHTML = ''
    // Clear comments html
    } else {
      comments.innerHTML = ''
    }
    // Add a loading bar if waiting on articles
    if (toggle && !inComments) {
      articleDisplay.innerHTML = `
        <div class="progress red lighten-4" style="width: 20%; margin: 3rem auto;">
          <div class="indeterminate red"></div>
        </div>`
    }
    if (toggle && inComments) {
      comments.innerHTML = `
        <div class="progress red lighten-4" style="width: 20%; margin: 3rem auto;">
          <div class="indeterminate red"></div>
        </div>`
    }
  }

  // Called if no articles are found in the DB and allows user to scrape new articles to DB.
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
      displayLoader(true, false)
      await postArticles()
      getArticlesFromDb()
    })
  }

  // Scrape articles and POST them to DB
  const postArticles = async () => {
    const fetchRes = await window.fetch('/articles', {
      method: 'POST'
    })
    const count = await fetchRes.json()
    // Display how many articles were scraped
    openQuantModal(count / 2)
  }

  // Get articles from the DB
  const getArticlesFromDb = async function () {
    const fetchRes = await window.fetch('/articles', {
      method: 'GET'
    })
    const body = await fetchRes.json()
    // If articles are returned, display them
    if (body.length > 0) {
      displayLoader(false, false)
      displayArticles(body)
    // If no articles, allow users to scrape new articles.
    } else {
      displayNoArticles()
    }
  }
  getArticlesFromDb()

  // GET all saved articles
  const getSavedArticles = async () => {
    const fetchRes = await window.fetch('/articles?saved=true')
    const body = await fetchRes.json()
    if (body.length > 0) {
      displayArticles(body, onSavedPage)
    } else {
      articleDisplay.innerHTML = `
        <div class="no-articles">
          <span>No saved articles found. Try saving an article first...</span>
        </div>
        <div class="center-align" style="margin: 1rem;">
          <a href="/" id="home-button-saved" class="waves-efect waves-light btn red">Home</a>
        </div>`
      document.getElementById('home-button-saved').addEventListener('click', () => {
        onSavedPage = false
      })
    }
  }

  // Map articles and display them
  const displayArticles = (articles) => {
    let newHtml = ''
    displayLoader(true, false)
    if (onSavedPage) {
      articles.map(article => {
        if (article.saved) {
          fixStrings(article)
          const cardHTML = createArticleCard(article)
          newHtml += cardHTML
        }
      })
    } else {
      articles.map(article => {
        fixStrings(article)
        const cardHTML = createArticleCard(article)
        newHtml += cardHTML
      })
    }
    displayLoader(false, false)
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
    // Add comment and unfavorite icon if article is saved.
    if (article.saved) {
      cardHTML += `
              <a class="tooltipped comment-icon" data-id="${article._id}" data-tooltip="View Comments">
                <i class="fas fa-comment"></i>
              </a>
              <a class="tooltipped unfavorite-icon" data-id="${article._id}" data-tooltip="Unsave Article">
                <i class="fas fa-star"></i>
              </a>`
    // Add favorite icon if article is not saved
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
        setSaveArticle(articleId, true)
      })
    })
  }

  const initUnsaveButtons = () => {
    const elems = document.getElementsByClassName('unfavorite-icon')
    Array.from(elems).forEach(function (elem) {
      elem.addEventListener('click', function (e) {
        const articleId = this.getAttribute('data-id')
        closeTooltip(this)
        setSaveArticle(articleId, false)
      })
    })
  }

  const initCommentButtons = () => {
    const elems = document.getElementsByClassName('comment-icon')
    Array.from(elems).forEach(function (elem) {
      elem.addEventListener('click', function (e) {
        const articleId = this.getAttribute('data-id')
        closeTooltip(this)
        getComments(articleId)
      })
    })
  }

  // Set the saved status an article
  const setSaveArticle = async (id, saved) => {
    const fetchRes = await window.fetch(`/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ saved })
    })
    const body = await fetchRes.json()
    displayArticles(body)
  }

  // Get comments from DB for one article
  const getComments = async (id) => {
    const fetchRes = await window.fetch(`/articles/${id}`, { method: 'GET' })
    const body = await fetchRes.json()
    displayLoader(true, true)
    await setupCommentModal(body)
    openCommentModal(body)
  }

  // Append each comment to article comment modal
  const setupCommentModal = (body) => {
    document.getElementById('article-id').innerHTML = body._id
    // If any comments exist, display them
    if (body.length > 0) {
      body.map(comment => {
        comments.innerHTML = ''
        const commentHTML = `
          <div class="col s12 comment">
            <p style="display:inline;">${comment.body}</p>
            <a class="btn red delete-comment" style="float:right;">
              <i class="fas fa-trash-alt"></i>
            </a>
          </div>`
        comments.innerHTML += commentHTML
      })
    // If no comments, display no comments notification
    } else {
      comments.innerHTML = ``
      const commentHTML = `
        <div style="background-color:rgb(255, 187, 0); padding: 4px; border-radius: 3px;">
          <span style="color: #fff;">
            <i class="fas fa-exclamation-triangle"></i>
            No comments found for this article. Try adding one below.
          </span>
        </div>`
      comments.innerHTML += commentHTML
    }
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

  document.getElementById('saved-articles').addEventListener('click', () => {
    // Show saved articles only
    onSavedPage = true
    getSavedArticles()
  })

  document.getElementById('home-button').addEventListener('click', () => {
    onSavedPage = false
  })

  // Save a comment to an article
  document.getElementById('save-comment').addEventListener('click', async () => {
    const comment = document.getElementById('comment-textarea').value
    const id = document.getElementById('article-id').innerHTML
    const fetchRes = await window.fetch(`/articles/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    })
    const body = await fetchRes.json()
    console.log(body)
    // document.getElementById('comments').innerHTML += `
    //   <div class="col s12 comment">
    //     <p style="display:inline;">${comment.value}</p>
    //     <a class="btn red delete-comment" style="float:right;">
    //       <i class="fas fa-trash-alt"></i>
    //     </a>
    //   </div>
    // `
    // document.getElementsByClassName('delete-comment').addEventListener('click', function () {

    // })
    comment.value = ''
  })
})
