const express = require("express");
const router = express.Router();
// models/index.js exports a db object with our Article instance as one of its properties.
const Article = require("../models").Article;

// Handler function to wrap each route. Now we won't have to write a bunch of try catch statements.
function asyncHandler(cb) {
	return async (req, res, next) => {
		try {
			await cb(req, res, next);
		} catch (error) {
			res.status(500).send(error);
		}
	};
}

// GET articles listing
// Note that this is at whatever.com/articles
router.get(
	"/",
	// Call asyncHandler and pass it an anonymous async callback. The cb takes the request and response
	asyncHandler(async (req, res) => {
		// Await Article's findAll method's returned value and store it in 'articles'
		const articles = await Article.findAll({
			// findAll takes an object with SQL like options. Here we're basically doing a 'ORDER BY createdAt DESC'
			order: [["createdAt", "DESC"]]
		});
		// Now we can render the page and pass in the articles prop we created above.
		res.render("articles/index", { articles, title: "simpleBlog!" });
	})
);

// Create a new article form.
// Note that this at articles/new'
router.get("/new", (req, res) => {
	// We're passing in an empty article object, but I'm not sure why
	res.render("articles/new", { article: {}, title: "New Article" });
});

/* POST create article. */
router.post(
	"/",
	asyncHandler(async (req, res) => {
		try {
			// We await the creation of the new row in our table
			// We pass into create() an object with the properties that we specified in the model. But we've built the form to get that info, so we just need to pass in req.body. The request body is an object with exactly the properties that we need.
			const article = await Article.create(req.body);
			// We redirect to the new article. We'll write a route for this below.
			res.redirect("/articles/" + article.id);
		} catch (error) {
			// checking the error
			if (error.name === "SequelizeValidationError") {
				// Note that we're using build(), which creates a temporary article. Later on, after errors have been dealt with and the user has resubmitted the form, the article is saved to the database with create()
				article = await Article.build(req.body);
				res.render("articles/new", {
					article,
					errors: error.errors,
					title: "New Article"
				});
			} else {
				// This error will be caught in the asyncHandler's catch block
				throw error;
			}
		}
	})
);

/* Edit article form. */
router.get(
	"/:id/edit",
	asyncHandler(async (req, res) => {
		// In order to edit an article, we need to find it with findByPk(), which takes the article id, which we get from req.params.id
		const article = await Article.findByPk(req.params.id);
		// If finding the article is successful, then render the edit view, passing in the details specific to that article, so that the edit view loads with the article content in it. 
		// NOTE: Part of what really confused me here for a while is that I kept mistaking the path to the view for a route. 
		if (article) {
			res.render("articles/edit", { article, title: "Edit Article" });
		} else {
			res.sendStatus(404);
		}
	})
);

/* GET individual article. */
router.get(
	"/:id",
	asyncHandler(async (req, res) => {
		// We await the search for our article record.
		// We pass in the 'id' that appears in the url parameter. It corresponds to the article id in the table.
		const article = await Article.findByPk(req.params.id);
		if (article) {
			// article is ES6 shorthand for article: article where the value is the article record that was just retrieved from the table
			res.render("articles/show", { article, title: article.title });
			// If no article is returned we send a 404 error status
		} else {
			res.sendStatus(404);
		}
	})
);

/* Update an article. */
// To update an article we need to post to the /:id/edit route
router.post(
	"/:id/edit",
	asyncHandler(async (req, res) => {
	// Define article outside the try...catch
    let article;
		try {
			// Await the findByPk() method's returned value
			article = await Article.findByPk(req.params.id);
			// We're using await, so a promise is returned, so I can chain the next command to article. So here we're awaiting the update() method. We passed in the request body with all of our form submission data
			await article.update(req.body);
			// If awaiting article is successful, then render the article again.  
			if (article) {
				//NOTE: I couldn't get this to work for a while b/c I was treating the path to the article template as though it were a route
				res.render('articles/show', {
					article,
					title: article.title
				});
			} else {
				res.sendStatus(404);
			}
    	// Form validation happens here
		} catch (error) {
			if (error.name === "SequelizeValidationError") {
				article = await Article.build(req.body);
        // make sure correct article gets updated
        article.id = req.params.id; 
				res.render("articles/edit", {
					article,
					errors: error.errors,
					title: "Edit Article"
				});
			} else {
				throw error;
			}
		}
	})
);

/* Delete article form. */
router.get(
	"/:id/delete",
	asyncHandler(async (req, res) => {
		const article = await Article.findByPk(req.params.id);
		if (article) {
			res.render("articles/delete", { article, title: "Delete Article" });
		} else {
			res.sendStatus(404);
		}
	})
);

/* Delete individual article. */
router.post(
	"/:id/delete",
	asyncHandler(async (req, res) => {
		const article = await Article.findByPk(req.params.id);
		await article.destroy();
		if (article) {
			res.redirect("/articles");
		} else {
			res.sendStatus(404);
		}
	})
);

module.exports = router;
