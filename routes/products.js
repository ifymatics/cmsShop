const express = require('express');
const fs = require('fs-extra');
const route = express.Router();
let Product = require('../models/product');


//GET All products
route.get('/', (req, res, next) => {

    Product.find({}).then(products => {

        res.render('all_products', { title: 'All products', products: products, isActive: 'home' });

    }).catch(err => console.log(err));
});

//GET  products by category type
route.get('/:category', (req, res, next) => {
    let cat = req.params.category;
    Product.find({ category: cat }).then(products => {

        res.render('all_products', { title: products.category, products: products, isActive: 'home' });

    }).catch(err => console.log(err));
});

//GET a product details
route.get('/:category/:product', (req, res, next) => {
    let imageGallery = null;
    let slug = req.params.product;
    let category = req.params.category;
    Product.findOne({ slug: slug }).then(product => {
        let galleryDir = `public/product_images/${product._id}/gallery`;
        fs.readdir(galleryDir).then(files => {
            imageGallery = files;
            res.render('product_details', { imageGallery: imageGallery, product: product, title: product.title, isActive: 'home' });
        }).catch(err => console.log(err));
    });

});



module.exports = route;