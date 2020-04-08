const mongoose = require('mongoose');
const UserSchema = mongoose.Schema;
const userSchema = new UserSchema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    admin: {
        type: Number,
    },

});
module.exports = mongoose.model('User', userSchema);
