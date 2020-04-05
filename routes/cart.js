const express = require('express');
const route = express.Router();
let Product = require('../models/product');

//GET add product to cart
route.get('/add/:product', (req, res, next) => {
    let slug = req.params.product;
    //console.log(slug)
    Product.findOne({ slug: slug }).then(product => {

        if (typeof req.session.cart === 'undefined') {
            console.log('chai')
            req.session.cart = [];
            // console.log(req.session.cart)
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(product.price).toFixed(2),
                image: `/product_images/${product._id}/${product.image}`
            });
        } else {
            let newItem = true;
            let cart = req.session.cart;
            for (let c of cart) {
                // console.log(c.title, slug)
                if (c.title === slug) {
                    c.qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem) {
                req.session.cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: `/product_images/${product._id}/${product.image}`
                });
            }
        }

        req.flash('success', 'Product added to cart successfully');
        res.redirect('back');

    }).catch(err => console.log(err));
});

//GET a checkout page
route.get('/checkout', (req, res, next) => {
    req.session.rout = null;
    let cart = req.session.cart;
    console.log(cart)
    res.render('checkout', { title: 'checkout', cart: cart, isActive: 'checkout' });


});

//GET Update product

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

module.exports = route;