const router = require('express').Router();
const TheoryArticle = require('../models/theory_article');

// router.get('/theory/:category/:id', async (req, res) => {
//
// });

router.post('/theory', async (req, res) => {
    const articleData = req.body;
    console.log(articleData);
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
