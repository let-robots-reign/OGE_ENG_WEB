const mongoose = require('mongoose');

const uoeTaskSchema = new mongoose.Schema({
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
    origin: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    completion: {
        type: Number,
        required: false,
        default: 0
    }
}, {collection: 'uoe_tasks'});

module.exports = mongoose.model('UoeTask', uoeTaskSchema);
