const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    task: {
        type: String,
        required: true,
    },
    result: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
    }
}, { collection: 'users_activity' });

module.exports = mongoose.model('User Activity', userActivitySchema);
