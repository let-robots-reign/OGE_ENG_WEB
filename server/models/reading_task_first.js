const mongoose = require('mongoose');

const readingTaskFirstSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
}, {collection: 'reading_tasks_section_1'});

module.exports = mongoose.model('ReadingTaskFirst', readingTaskFirstSchema);
