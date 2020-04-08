const express = require('express');
const route = express.Router();
let Order = require('../models/order');


//GET  order page
route.get('/', (req, res, next) => {

    if (!req.user) {
        res.render('user/orders', { title: 'My Orders', isActive: 'orders', orders: null });
    } else {
        Order.find({}).where('user_id', req.user._id)
            .then(orders => {
                if (orders.length > 0)
                    res.render('user/orders', { title: 'My Orders', isActive: 'orders', orders: orders })
                else
                    res.render('user/orders', { title: 'My Orders', isActive: 'orders', orders: null })
            }).catch(err => console.log(err));
    }

});


module.exports = route;