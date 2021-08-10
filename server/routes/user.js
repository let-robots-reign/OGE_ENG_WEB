const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

router.post('/signup', async (req, res) => {
    const userData = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
    });
    // TODO: check for existing user
    const result = await user.save();
    // eslint-disable-next-line no-unused-vars
    const {password, ...data} = await result.toJSON();

    const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 10 * 24 * 60 * 60 * 1000  // 10 days
    });

    res.status(201).send(data);
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

    res.status(200).send({
        message: 'success'
    });
});

router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];
        const token = jwt.verify(cookie, process.env.JWT_SECRET);

        if (!token) {
            return res.status(401).send({
                message: 'invalid jwt token'
            });
        }

        const user = await User.findOne({_id: token._id});
        // eslint-disable-next-line no-unused-vars
        const {password, ...data} = await user.toJSON();
        res.status(200).send(data);
    } catch (e) {
        return res.status(401).send({
            message: `unauthenticated, ${e}`
        });
    }
});

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 0});
    res.status(200).send({
        message: 'success'
    });
});

module.exports = router;
