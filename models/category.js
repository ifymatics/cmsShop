const mongoose = require('mongoose');
const CategorySchema = mongoose.Schema;
const categorySchema = new CategorySchema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }

});
module.exports = mongoose.model('Category', categorySchema);
