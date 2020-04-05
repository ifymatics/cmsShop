const express = require('express');
const { check, validationResult } = require('express-validator');
const route = express.Router();
const csrf = require('csurf');
const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcryptjs');
let csrfProtection = csrf({ cookie: true });

route.use(csrfProtection);

//GET regitser page
route.get('/register', (req, res, next) => {
    let title = 'Register';
    res.render('user/register', { title: title, isActive: 'register', csrfToken: req.csrfToken() });
});

//POST register page
route.post('/register', [
    check('full_name', 'full name must not be empty').not().isEmpty(),
    check('username', 'phone umber must not be empty and must be a valid number').not().isEmpty().isDecimal(),
    check('password', 'password must not be empty').not().isEmpty(),
    check('email', 'email must not be empty').not().isEmpty().isEmail(),
],
    (req, res, next) => {

        let full_name = req.body.full_name;
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        let title = "Register";
        isActive = "register";
        let errors = validationResult(req);

        if (!errors.isEmpty()) {

            res.render('user/register', { title: title, isActive: isActive, errors: errors.array(), full_name: full_name, username: username, email: email, user: null, csrfToken: req.csrfToken() });
        } else {
            User.findOne({ username: username } && { email: email }).then(user => {
                if (user) {
                    req.flash('danger', 'Phone number or email is already in use');
                    res.redirect('/users/register');
                } else {
                    let user = new User({
                        full_name: full_name,
                        username: username,
                        email: email,
                        password: password,
                        admin: 0

                    });
                    bcrypt.genSalt(10).then(salt => {
                        bcrypt.hash(user.password, salt).then(
                            hashedPassword => {
                                user.password = hashedPassword;
                                user.save().then(user => {
                                    req.flash('success', 'Your registration is successful');
                                    res.redirect('/users/login')
                                }).catch(err => console.log(err));
                            }
                        ).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                }

            }).catch(err => console.log(err));
        }
    });

//GET login page
route.get('/login', (req, res, next) => {
    if (res.locals.user) res.redirect('/')
    let title = 'Login';
    res.render('user/login', { title: title, isActive: 'login', csrfToken: req.csrfToken() });
});

route.post('/login', (req, res, next) => {
    console.log(req.session.rout)
    passport.authenticate('local', {
        successRedirect: req.session.rout ? req.session.rout : '/',
        failureRedirect: 'login',
        failureFlash: true,
        successFlash: true
    })(req, res, next);
});
route.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success', 'You have successfully logged out');
    res.redirect('/')
    // res.redirect('/users/login')
});
module.exports = route;