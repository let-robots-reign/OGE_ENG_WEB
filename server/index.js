const express = require('express');
const mongoose = require('mongoose');

const DB_PATH = 'mongodb://localhost/oge_eng_db';
mongoose.connect(DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database');
});

const routes = require('./routes/routes');
const app = express();
app.use('/api/v1', routes);

app.listen(8000);
