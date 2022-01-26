const mongoose = require('mongoose');

const audioTaskFirstSchema = new mongoose.Schema({
    _id: {
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
    audio: {
        type: String,
        required: true
    },
}, {collection: 'audio_tasks_section_1'});

module.exports = mongoose.model('AudioTaskFirst', audioTaskFirstSchema);
