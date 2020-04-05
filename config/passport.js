const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = passport => {
    passport.use(new localStrategy(
        (username, password, done) => {
            User.findOne({ username: username }).then(user => {
                if (!user) {
                    return done(null, false, { message: "No user found!" });
                }
                bcrypt.compare(password, user.password).then(isMatch => {
                    if (isMatch) return done(null, user, { message: "Login is successful!" });
                    else return done(null, false, { message: "Wrong password!" });
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }
    ));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });

    });
}