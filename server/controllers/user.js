const bcrypt = require('bcryptjs');
const User = require('../models/user');
const UserActivity = require('../models/user_activity');

class UserController {
    async createUser(userData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const user = new User({
            name: userData.name,
            email: userData.email,
            desiredMark: userData.desiredMark,
            password: hashedPassword
        });

        const result = await user.save();
        // eslint-disable-next-line no-unused-vars
        const {password, ...data} = await result.toJSON();
        data.role = (process.env.ADMIN_LOGINS.split(',').includes(data.name)) ? 'admin' : 'user';
        return data;
    }

    async checkIfExists(filter) {
        return await User.exists(filter);
    }

    async getUser(filter) {
        const user = await User.findOne(filter);
        if (!user) return null;
        const data = await user.toJSON();
        data.role = (process.env.ADMIN_LOGINS.split(',').includes(data.name)) ? 'admin' : 'user';
        return data;
    }

    async saveUserActivity(activityData) {
        const activity = new UserActivity(activityData);
        await activity.save();
    }
}

module.exports = UserController;
