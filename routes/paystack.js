const express = require('express');
const request = require('request');
const route = express.Router();
const http = require('http');

const { initializePayment, verifyPayment } = require('../config/paystack')(request);

//initialize payment
route.post('/pay', (req, res, next) => {

    if (req.user) {
        const form = { 'amount': 0, 'email': '', 'full_name': '' };
        form.amount = req.body.amount;
        form.email = req.body.email;
        form.full_name = req.body.full_name;
        form.items = req.body.items

        form.metadata = {
            full_name: form.full_name,
            items: form.items
        }
        form.amount //*= 100;
        console.log(form)
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
            return res.redirect('/error');
        }
        response = JSON.parse(body);
        console.log(response)
        // const data = _.at(response.data, ['reference', 'amount', 'customer.email', 'metadata.full_name']);
        const data = response.data;
        if (data.status === 'success') {

        }

        // [reference, amount, email, full_name] = data;
        // newDonor = { reference, amount, email, full_name }
        // const donor = new Donor(newDonor)
        // donor.save().then((donor) => {
        //     if (donor) {
        //         res.redirect('/receipt/' + donor._id);
        //     }
        // }).catch((e) => {
        //     res.redirect('/error');
        // })
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

module.exports = route;