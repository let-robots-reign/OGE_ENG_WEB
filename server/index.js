const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({
    path: '../config.env'
});

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database');
});

const routes = require('./routes/routes');

const app = express();
app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL]
}));
app.use('/api/v1', routes);

app.listen(8000);
