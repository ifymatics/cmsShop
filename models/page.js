const mongoose = require('mongoose');
const PageSchema = mongoose.Schema;
const pageSchema = new PageSchema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    },

});
module.exports = mongoose.model('Page', pageSchema);
