const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

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

    res.send(user);
});

module.exports = router;
