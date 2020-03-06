const express = require('express');
const router = express.Router();
const Article = require('../models').Article;
const asyncHandler = require('../scripts/helpers.js');

router.get('/', rootController);
router.get('/new', formController);
router.post('/', formPostController);
router.get('/:id/edit', articleEditController);
router.get('/:id', articleController);
router.post('/:id/edit', articleEditPostController);
router.get('/:id/delete', deleteArticleController);
router.post('/:id/delete', deleteArticlePostController);

// Root route controller
function rootController(req, res) {
    asyncHandler(async (req, res) => {
        const articles = await Article.findAll({order: [['createdAt', 'DESC']]});
        res.render('articles/index', {articles, title: 'simpleBlog!'});
    });
}

// Form get controller
function formController(req, res) {
    res.render('articles/new', {article: {}, title: 'New Article'});
}

// Form post controller
function formPostController(req, res) {
    asyncHandler(async (req, res) => {
        try {
            const article = await Article.create(req.body);
            res.redirect('/articles/' + article.id);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                article = await Article.build(req.body);
                res.render('articles/new', { article, errors: error.errors, title: 'New Article' });
            } else { throw error }
        }
    });
}

// 'Edit article' get controller
function articleEditController(req, res){
	asyncHandler(async (req, res) => {
        const article = await Article.findByPk(req.params.id);
        if (article) {
            res.render('articles/edit', {article, title: 'Edit Article'});
        } else {
            res.sendStatus(404);
        }
    })
}

// Article get controller
function articleController(req,res){
	asyncHandler(async (req, res) => {
        const article = await Article.findByPk(req.params.id);
        if (article) {
            res.render('articles/show', {article, title: article.title});
        } else {
            res.sendStatus(404);
        }
    });
}

// Article edit post controller
function articleEditPostController(req, res){
	asyncHandler(async (req, res) => {
        let article;
        try {
            article = await Article.findByPk(req.params.id);
            await article.update(req.body);
            if (article) {
                res.render('articles/show', { article, title: article.title,});
            } else {
                res.sendStatus(404);
            }
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
				article = await Article.build(req.body);
				// Ensure correct article id
                article.id = req.params.id;
                res.render('articles/edit', { article, errors: error.errors, title: 'Edit Article' });
            } else { throw error }
        }
    })
}

// Delete article controller
function deleteArticleController(req, res){
	asyncHandler(async (req, res) => {
        const article = await Article.findByPk(req.params.id);
        if (article) {
            res.render('articles/delete', {article, title: 'Delete Article'});
        } else {
            res.sendStatus(404);
        }
    })
}

// Delete article post controller
function deleteArticlePostController(req, res){
	asyncHandler(async (req, res) => {
        const article = await Article.findByPk(req.params.id);
        await article.destroy();
        if (article) {
            res.redirect('/articles');
        } else {
            res.sendStatus(404);
        }
    })
}

module.exports = router;
