const router = require('express').Router();
const TheoryArticle = require('../models/theory_article');

router.get('/theory/category/:category', async (req, res) => {
    const category = req.params.category;
    const items = await TheoryArticle.find({category: category}).select('title');
    res.status(200).send({
        message: 'success',
        items,
    });
});

router.get('/theory/:id', async (req, res) => {
    const {id} = req.params;
    const {content} = await TheoryArticle.findOne({_id: id});
    res.status(200).send({
        message: 'success',
        content: content,
    });
});

router.post('/theory', async (req, res) => {
    const articleData = req.body;
    const article = new TheoryArticle({
        category: articleData.category,
        title: articleData.title,
        content: articleData.content
    });

    const result = await article.save();
    console.log(result);
    res.status(201).send({
        message: 'success'
    });
});

module.exports = router;
