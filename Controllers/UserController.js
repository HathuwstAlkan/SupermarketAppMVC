const User = require('../Models/User');

const UserController = {
    showLogin: (req, res) => {
        res.render('login', { 
            errors: [],
            user: req.session.user || null
        });
    },

    showRegister: (req, res) => {
        res.render('register', {
            errors: [],
            user: req.session.user || null
        });
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.authenticate(username, password);
            if (user) {
                req.session.user = user;
                res.redirect('/');
            } else {
                res.render('login', {
                    errors: ['Invalid username or password'],
                    user: null
                });
            }
        } catch (err) {
            res.render('login', {
                errors: [err.message],
                user: null
            });
        }
    }
};

module.exports = UserController;