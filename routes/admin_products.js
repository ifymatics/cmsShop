const express = require('express');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const Product = require('../models/product');
const Category = require('../models/category');

const { check, validationResult } = require('express-validator');
const route = express.Router();


route.get('/', (req, res, next) => {

    let count = 0;
    Product.countDocuments({}).then(c => count = c)
        .catch(err => console.log(err));
    Product.find().then(products => {
        res.render('admin/products', { count: count, products: products, title: "" })
    });


});
//GET add product page
route.get('/add-product', (req, res, next) => {
    const title = "";
    const desc = "";
    const price = "";

    Category.find({}).then(categories => {
        res.render('admin/add_product', { title: title, desc: desc, price: price, categories: categories });
    })
        .catch(err => console.log(err))

});
function isImage(files) {

    // if (files !== null  ) {

    let extension = files !== '' ? files.split('.').pop() : '';
    // console.log(extension)
    switch (extension) {
        case 'jpg':
            return true;
        case 'jpeg':
            return true;

        case 'png':
            return true;
        case '':
            return true;

        default:
            return false;
    }
    // } else return false;
}

//POST add product 
route.post('/add-product', [

    check('title', 'title must not be empty').not().isEmpty(),
    check('desc', 'description must not be empty').not().isEmpty(),
    check('price', 'price must not be empty').not().isEmpty().isDecimal(),
    //check('image', 'image must not be empty').isMimeType('image/png'),

],
    (req, res, next) => {

        let imageFile = req.files !== null ? req.files.image.name : '';
        const title = req.body.title;
        const desc = req.body.desc;
        const price = req.body.price;
        const image = imageFile;
        let slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

        let errors = [];
        errors = validationResult(req);

        if (!isImage(imageFile))

            errors.errors.push({ value: '', msg: 'You must upload an image', param: 'image', location: 'body' })

        if (!errors.isEmpty())
            Category.find({}).then(categories => {
                res.render('admin/add_product', { title: title, desc: desc, price: price, categories: categories, errors: errors.array() });
            }).catch(err => console.log(err));

        else {
            Product.findOne({ 'slug': slug }, (err, product) => {
                if (product) {
                    req.flash('danger', 'product title already exists!');
                    Category.find({}).then(categories => {
                        res.render('admin/add_product', { title: title, desc: desc, price: price, categories: categories });
                    }).catch(err => console.log(err));
                } else {
                    let product = new Product({
                        title: title,
                        desc: desc,
                        price: parseFloat(price).toFixed(2),
                        slug: slug,
                        image: image,
                        category: req.body.category

                    });

                    product.save().then(product => {


                        mkdirp("public/product_images/" + product._id).catch((err) => {

                            return console.log(err)
                        });
                        mkdirp("public/product_images/" + product._id + "/gallery").catch((err) => {

                            return console.log(err)
                        });
                        mkdirp("public/product_images/" + product._id + "/gallery/thumbs")
                            .catch((err) => {

                                return console.log(err)
                            }).then(done => {
                                if (imageFile != "") {
                                    //console.log(req.files.image)
                                    let productImage = req.files.image;
                                    let path = "public/product_images/" + product._id + "/" + imageFile;
                                    productImage.mv(path, function (err) { return console.log(err + 'chai') });
                                }
                                req.flash('success', 'product added successfully');
                                res.redirect('/admin/products');
                            });


                    }).catch(err => console.log(err));
                }
            });

        }

    });


//GET Edit product page
route.get('/edit-product/:id', (req, res, next) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    Category.find({}).then(categories => {
        Product.findById(req.params.id).
            then(product => {
                let galleryDir = `public/product_images/${product._id}/gallery`;
                let galleryImages = null;
                fs.readdir(galleryDir).then(files => {
                    console.log(files)
                    galleryImages = files;
                    res.render('admin/edit_product', { title: product.title, price: parseFloat(product.price).toFixed(2), desc: product.desc, id: product._id, categories: categories, category: product.category.replace(/\s+/g, '-').toLowerCase(), image: product.image, errors: errors, galleryImages: galleryImages, });
                }).catch(err => console.log(err));

            }).catch(error => {
                console.log(error);
                res.redirect('admin/products');
            });
    }).catch(err => console.log(err));

});
//POST Edit product page
route.post('/edit-product/:id', [

    check('title', 'title must not be empty').not().isEmpty(),
    check('desc', 'description must not be empty').not().isEmpty(),
    check('price', 'price must not be empty').not().isEmpty().isDecimal(),

],
    (req, res, next) => {

        let imageFile = req.files !== null ? req.files.image.name : '';
        const title = req.body.title;
        const desc = req.body.desc;
        const price = req.body.price;
        const pimage = req.body.pimage;
        const id = req.params.id;
        let slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

        let errors = [];

        errors = validationResult(req);

        if (!isImage(imageFile))

            errors.errors.push({ value: '', msg: 'You must upload an image', param: 'image', location: 'body' })

        if (!errors.isEmpty()) {
            req.session.errors = errors;
            Category.find({}).then(categories => {
                res.render(`admin/edit_product/${id}`, { title: title, desc: desc, price: price, categories: categories, errors: errors.array() });
            }).catch(err => console.log(err));
        }
        else {
            Product.findOne({ 'slug': slug, '_id': { '$ne': id } }, (err, product) => {
                if (product) {
                    req.flash('danger', 'product does not exists!');

                    Category.find({}).then(categories => {
                        res.render('admin/edit_product/' + id, { title: product.title, price: product.price, desc: product.desc, id: product._id, categories: categories });
                    }).catch(error => console.log(error));
                } else {
                    Product.findById(id).then(product => {

                        product.title = title;
                        product.slug = slug;
                        product.desc = desc;
                        product.price = price;
                        product.category = req.body.category;
                        if (imageFile != "")
                            product.image = imageFile;

                        product.save().then(done => {
                            if (imageFile != "") {
                                if (pimage != "") {
                                    fs.remove(`public/product_images/${id}/${pimage}`)
                                        .then(done => console.log('success!!'))
                                        .catch(err => console.log(err + 'ewoooooo'))
                                }
                                let productImage = req.files.image;
                                let path = "public/product_images/" + id + "/" + imageFile;
                                productImage.mv(path).catch((err) => { return console.log(err + 'chai') });
                            }
                            req.flash('success', 'product edited successfully');
                            res.redirect(`/admin/products`);
                        }).catch(err => {
                            console.log(error)
                        });
                    }).catch(err => console.log(err));

                }
            });

        }

    });
//POST upload gallery
route.post('/product-gallery/:id', (req, res, next) => {
    let productImage = req.files.file;
    let id = req.params.id;
    let path = `public/product_images/${id}/gallery/${req.files.file.name}`;
    let thumbsPath = `public/product_images/${id}/gallery/thumbs/${req.files.file.name}`;
    productImage.mv(path).then(done => {
        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(buf => fs.writeFileSync(thumbsPath, buf));
    }).catch(err => console.log(err));
    res.sendStatus(200);
});
//GET Delete Gallery Image
route.get('/delete-image/:image', (req, res, next) => {
    let id = req.query.id;
    let image = req.params.image;
    let originalImage = `public/product_images/${id}/gallery/${image}`;
    let thumsImage = `public/product_images/${id}/gallery/thumbs/${image}`;
    fs.remove(originalImage).then(done => {
        fs.remove(thumsImage).then(done => {
            req.flash('success', 'image deleted');
            res.redirect(`/admin/products/edit-product/${id}`);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));


});
//GET Delete  product
route.get('/delete-product/:id', (req, res, next) => {
    let id = req.params.id;
    path = `public/product_images/${id}`;
    fs.remove(path).then(done => {
        console.log(done);
        Product.findByIdAndDelete({ '_id': id }).
            then(product => {
                req.flash('success', 'product deleted');
                res.redirect('/admin/products');
            }).
            catch(error => console.log(error));
    }).catch(err => console.log(err));
});
module.exports = route;