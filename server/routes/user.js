const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/user');

require('dotenv').config();

router.post('/signup', async (req, res) => {
    const userData = req.body;
    // TODO: fields validation
    const existing = await userController.checkIfExists({ email: userData.email });
    if (existing) {
        return res.status(400).send({
            message: 'user already exists',
        });
    }
    const user = await userController.createUser(userData);
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,  // 10 days
        sameSite: 'none',
        secure: true
    });

    res.status(201).send({
        message: 'success',
        user
    });
});

router.post('/login', async (req, res) => {
    const userData = req.body;
    const user = await userController.getUser({ email: userData.email });
    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        });
    }
    console.log(user);
    if (!await bcrypt.compare(userData.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        });
    }

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,  // 10 days,
        sameSite: 'none',
        secure: true,
    });

    delete user.password;

    res.status(200).send({
        message: 'success',
        user
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

        const user = await userController.getUser({ _id: token._id });
        delete user.password;
        res.status(200).send(user);
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
