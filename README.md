[![Mongo Scraper Logo](./public/images/readme/mongoscraper_logo.JPG "Visit Mongo Scraper on Heroku")](https://mognoscraper.herokuapp.com/)

# Mongo Scraper

> Mongo Scraper is an app that scrapes articles from The New York Timess to a Mongo database and displays them on the page. It also allows the user to save and comment on articles.

## Features
- Scrape articles from www.nytimes.com/section/world and get info such as title, caption, author, thumbnail, and link for each article
- Save articles you want to track
- Post comments on saved articles
- Delete comments
- Unsave articles
- View saved articles only
- Clear the database of any unsaved articles

![Demo](./public/images/readme/demo.gif "Demo of scraping and saving/commenting on an article")

## Known Issues
- Ocassional incomplete article rendering when displaying articles to the page. This has to do with the way javascript is creating the articles and is fixed by interacting with the page or reloading.
- Clearing of unsaved articles sometimes requires a reload for the button to work.

## More info
I created this as a project to learn to use Mongoose in a Node app. It was an assignment for a 6-month coding bootcamp through GA tech and Trilogy. I challenged myself for this project to only use vanilla javascript for the frontend and did not use jQuery, which is what I'd used for most projects up until this point. This app was created in June of 2019.

**Technologies Used**
- Node.js
- Mongo & Mongoose
- Express
- Cheerio