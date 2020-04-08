const express = require('express');
const request = require('request');
const route = express.Router();
let Order = require('../models/order');
let Cart = require('../models/cart');
const { initializePayment, verifyPayment, MySecretKey } = require('../config/paystack')(request);

//initialize payment
route.post('/pay', (req, res, next) => {
    //console.log(req.body)
    if (req.user) {





        //create an order first
        let cart = new Cart(req.session.cart);
        let order = new Order({
            user_id: req.user._id,
            amount: cart.totalPrice,
            order_status: 'Not delivered yet',
            products: cart.generateArray(),
            trxStatus: 'pending',
            trxId: 0,
            date: new Date(),
            trxReference: ''
        });
        order.save().then(order => {
            let id = typeof order._id == 'string' ? order._id : String(order._id)


            const form = {
                'amount': req.body.amount, 'email': req.user.email, metadata: {

                    custom_fields: { id: id }

                }
            };

            initializePayment(form, (error, body) => {
                if (error) {
                    //handle errors
                    console.log(error);
                    return;
                }
                response = JSON.parse(body);
                // console.log(`statusCode: ${res.statusCode}`)
                // console.log(response)
                res.redirect(response.data.authorization_url)
            });
        }).catch(err => console.log(err));
        ///////////////////////

    } else {
        req.session.rout = '/cart/checkout';
        req.flash('danger', 'Please login to continue');
        res.redirect('/users/login')
    }


});

//GET callback
route.get('/callback', (req, res) => {

    const ref = req.query.reference;
    verifyPayment(ref, (error, body) => {
        if (error) {
            //handle errors appropriately
            console.log(error)
            req.flash('danger', 'Your payment was not successful');
            res.redirect('/cart/checkout')
        }
        response = JSON.parse(body);
        const data = response.data;
        if (data.status === 'success') {
            // console.log('orderId:' + data.metadata.order_id)
            Order.findByIdAndUpdate(data.metadata.custom_fields.id, {
                trxStatus: 'Completed',
                trxId: data.id,
                trxReference: data.reference
            }).then(order => {
                req.session.cart = null;
                req.flash('success', 'Your payment was successfull');
                res.redirect('/order')

            }).catch(err => console.log(err));
        } else {
            req.flash('danger', data.status);
            res.redirect('/cart/checkout')
        }

    })
});

route.get('/update/:product', (req, res, next) => {
    let cart = req.session.cart;
    let product = req.params.product;
    let action = req.query.action;
    if (typeof cart !== 'undefined') {
        for (let i in cart) {
            if (cart[i].title === product) {
                switch (action) {
                    case 'add':

                        cart[i].qty++


                        break;

                    case 'remove':

                        if (cart[i].qty > 0) {
                            cart[i].qty--;
                            if (cart[i].qty === 0) cart.splice(i, 1);
                            if (cart.length === 0) delete req.session.cart;
                        }


                        break;
                    case 'clear':
                        cart.splice(i, 1);
                        if (cart.length === 0) delete req.session.cart;
                        break;

                    default:
                        break;
                }
            }
        }

    }
    req.flash('success', 'Cart updated')
    res.redirect('back');
    //console.log(cart)

});

//GET clear cart
route.get('/clear', (req, res, next) => {
    delete req.session.cart;
    req.flash('success', 'cart cleared');
    res.redirect('back');

});
route.post('/cart/process', (req, res, next) => {
    console.log('chai')
    res.send({ 'data': 'success' });
});


// Using Express
route.post("/webhook/url", (req, res, next) => {
    //validate event

    let hash = crypto.createHmac('sha512', MySecretKey).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        let event = req.body;
        console.log(event, 'chaiiiiiiiiiiiiiiiiiiiiiiiiiii')
        // Do something with event  
    }
    res.send(200);
});
module.exports = route;