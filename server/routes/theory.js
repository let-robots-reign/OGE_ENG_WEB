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
    const {content, category} = await TheoryArticle.findOne({_id: id});
    res.status(200).send({
        message: 'success',
        content: content,
        category: category,
    });
});

router.post('/theory', async (req, res) => {
    const articleData = req.body;
    const article = new TheoryArticle({
        category: articleData.category,
        title: articleData.title,
        content: articleData.content
    });

    await article.save();
    res.status(201).send({
        message: 'success'
    });
});

router.put('/theory/:id', async (req, res) => {
    const articleData = req.body;
    const updateTo = {
        category: articleData.category,
        title: articleData.title,
        content: articleData.content
    };

    await TheoryArticle.findOneAndUpdate({ _id: articleData.id}, updateTo, {upsert: true});
    res.status(200).send({
        message: 'success'
    });
});

module.exports = router;
