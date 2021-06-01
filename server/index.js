const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

mongoose.connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database');
});

const routes = require('./routes/routes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL]
}));
app.use('/api/v1', routes);

app.listen(8000);
