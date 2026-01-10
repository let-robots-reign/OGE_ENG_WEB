const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, {collection: 'theory_articles'});

module.exports = mongoose.model('TheoryArticle', articleSchema);
