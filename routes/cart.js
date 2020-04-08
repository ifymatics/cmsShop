const express = require('express');
const csrf = require('csurf');
const route = express.Router();
let Product = require('../models/product');
let Cart = require('../models/cart');
let csrfProtection = csrf({ cookie: true });
//GET add product to cart
route.get('/add/:product', (req, res, next) => {
    let slug = req.params.product;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findOne({ slug: slug }).then(product => {
        product.price = parseFloat(product.price).toFixed(2);
        product.title = product.slug;
        product.image = `/product_images/${product._id}/${product.image}`;
        cart.add(product, product._id);
        req.session.cart = cart;
        req.flash('success', 'Product added to cart successfully');
        res.redirect('back');
    }).catch(err => console.log(err));

    // Product.findOne({ slug: slug }).then(product => {

    //     if (typeof req.session.cart === 'undefined') {

    //         req.session.cart = [];
    //         // console.log(req.session.cart)
    //         req.session.cart.push({
    //             title: slug,
    //             qty: 1,
    //             price: parseFloat(product.price).toFixed(2),
    //             image: `/product_images/${product._id}/${product.image}`
    //         });
    //     } else {
    //         let newItem = true;
    //         let cart = req.session.cart;
    //         for (let c of cart) {
    //             // console.log(c.title, slug)
    //             if (c.title === slug) {
    //                 c.qty++;
    //                 newItem = false;
    //                 break;
    //             }
    //         }
    //         if (newItem) {
    //             req.session.cart.push({
    //                 title: slug,
    //                 qty: 1,
    //                 price: parseFloat(product.price).toFixed(2),
    //                 image: `/product_images/${product._id}/${product.image}`
    //             });
    //         }
    //     }

    //     req.flash('success', 'Product added to cart successfully');
    //     res.redirect('back');

    // }).catch(err => console.log(err));
});
route.use(csrfProtection);
//GET a checkout page
route.get('/checkout', (req, res, next) => {
    req.session.rout = null;
    if (!req.session.cart) res.render('checkout', { title: 'checkout', cart: null, isActive: 'checkout', csrfToken: req.csrfToken() })
    else {
        let cart = new Cart(req.session.cart);

        res.render('checkout', { title: 'checkout', cart: cart.generateArray(), isActive: 'checkout', csrfToken: req.csrfToken() });
    }

});

//GET Update product

route.get('/update/:product', (req, res, next) => {
    let cartObj = new Cart(req.session.cart);
    let cart = cartObj.generateArray();
    let product = req.params.product;
    let action = req.query.action;

    if (cart) {

        for (let i in cart) {

            if (cart[i].item.title === product) {
                switch (action) {
                    case 'add':

                        cart[i].qty++


                        break;

                    case 'remove':

                        if (cart[i].qty >= 1) {
                            cart[i].qty--;
                            if (cart[i].qty === 0) {
                                cart.splice(i, 1);
                                console.log(cart[i])
                            }

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