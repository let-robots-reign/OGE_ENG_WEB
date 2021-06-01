const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config({
    path: '../config.env'
});

mongoose.connect(process.env.DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database');
});

const routes = require('./routes/routes');
const app = express();
app.use('/api/v1', routes);

app.listen(8000);
