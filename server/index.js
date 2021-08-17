const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config();

mongoose.connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database');
});

const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL]
}));

app.use('/api/v1', userRoutes);
app.use('/api/v1', taskRoutes);

app.use(express.static(path.resolve('./files')));

app.listen(8000);
