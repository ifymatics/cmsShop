const express = require('express');
const route = express.Router();
let Page = require('../models/page');
let Product = require('../models/product');

//GET home page
route.get('/', (req, res, next) => {


    // Page.findOne({ slug: 'home' }).then(page => {

    //     res.render('index', { title: page.title, slug: page.slug, content: page.content, isActive: page.slug });

    // });
    Product.find({}).then(products => {

        res.render('all_products', { title: 'All products', products: products, isActive: 'home' });

    }).catch(err => console.log(err));

});

//GET a page
route.get('/:slug', (req, res, next) => {
    let slug = req.params.slug;
    Page.findOne({ slug: slug }).then(page => {
        if (!page) res.redirect('/');
        else {
            res.render('index', { title: page.title, slug: page.slug, content: page.content, isActive: page.slug });
        }
    });

});



module.exports = route;