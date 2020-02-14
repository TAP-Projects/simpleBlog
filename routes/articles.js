const express = require('express');
const router = express.Router();
// models/index.js exports a db object with our Article instance as one of its properties.
const Article = require('../models').Article;

// Handler function to wrap each route. Now we won't have to write a bunch of try catch statements.
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* GET articles listing. */
router.get('/', asyncHandler(async (req, res) => {
  const articles = await Article.findAll({ order: [["createdAt", "DESC"]] });
  res.render("articles/index", { articles, title: "Sequelize-It!" });
}));

/* Create a new article form. */
router.get('/new', (req, res) => {
  // We're passing in an empty articles object
  res.render("articles/new", { article: {}, title: "New Article" });
});

/* POST create article. */
router.post('/', asyncHandler(async (req, res) => {
  // We await the creation of the new row in our table
  // We pass into create an object with the properties that we specified in the model. But we've built the form to get that info, so we just need to pass in req.body. The request body is an object with exactly the properties that we need.
  const article = await Article.create(req.body);
  // We redirect to the new article. We'll write a route for this below.
  res.redirect("/articles/" + article.id);
}));

/* Edit article form. */
router.get("/:id/edit", asyncHandler(async(req, res) => {
  const article = Article.findByPk(req.params.id);
  res.render("articles/edit", { article, title: "Edit Article" });
}));

/* GET individual article. */
router.get("/:id", asyncHandler(async (req, res) => {
  // We await the search for our article record.
  // We pass in the 'id' that appears in the url parameter. It corresponds to the article id in the table.
  const article = await Article.findByPk(req.params.id)
  // article is ES6 shorthand for article: article where the value is the article record that was just retrieved from the table
  res.render("articles/show", { article, title: article.title }); 
}));

/* Update an article. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  res.redirect("/articles/");
}));

/* Delete article form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  res.render("articles/delete", { article: {}, title: "Delete Article" });
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  res.redirect("/articles");
}));

module.exports = router;