const mongoose = require('mongoose');
const Product = require('./product');
const OrderSchema = mongoose.Schema;

const orderSchema = new OrderSchema({
    user_id: {
        type: String,
        required: true
    },
    order_status: {
        type: String,
        required: true
    },
    products: {
        type: [Object],
        required: true
    }
    ,
    amount: {
        type: String,
        required: true
    },
    trxStatus: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    trxId: {
        type: Number,

    },
    trxReference: {
        type: String,

    },


});
module.exports = mongoose.model('Order', orderSchema);
