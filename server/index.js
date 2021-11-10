const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

mongoose.connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('connected to the database'))
    .catch((err) => console.log('error connecting to mongo:', err));

const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const theoryRoutes = require('./routes/theory');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL, process.env.DOMAIN_NAME]
}));

app.use('/api/v1', userRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1', theoryRoutes);

app.listen(8000);
