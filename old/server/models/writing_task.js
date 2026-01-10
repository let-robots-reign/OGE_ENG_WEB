const mongoose = require('mongoose');

const writingTaskSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    topic: {
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
    }
}, {collection: 'writing_tasks'});

module.exports = mongoose.model('WritingTask', writingTaskSchema);