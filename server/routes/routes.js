const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config({
    path: '../config.env'
});

router.post('/signup', async (req, res) => {
    const userData = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
    });
    const result = await user.save();
    // eslint-disable-next-line no-unused-vars
    const {password, ...data} = await result.toJSON();

    res.send(data);
});

router.post('/login', async (req, res) => {
    const userData = req.body;
    const user = await User.findOne({email: userData.email});
    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        });
    }

    if (!await bcrypt.compare(userData.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        });
    }

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 10 * 24 * 60 * 60 * 1000  // 10 days
    });

    res.send({
        message: 'success'
    });
});

module.exports = router;
