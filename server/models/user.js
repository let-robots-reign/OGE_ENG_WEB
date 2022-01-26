const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    desiredMark: {
        type: Number,
        required: true,
    },
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
