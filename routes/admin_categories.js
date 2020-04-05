const express = require('express');
const Category = require('../models/category');

const { check, validationResult } = require('express-validator');
const route = express.Router();


route.get('/', (req, res, next) => {

    Category.find({}).exec((err, categories) => {
        console.log(categories)
        res.render('admin/categories', { title: 'Admin Area', categories: categories });

    });



});
//GET add category index page
route.get('/add-category', (req, res, next) => {
    const title = "";
    const slug = "";

    res.render('admin/add_categories', { title: title, slug: slug, brand: 'softHub' });
});

//POST add category 
route.post('/add-category', [

    check('title', 'title must not be empty').not().isEmpty(),
    //check('content', 'content must not be empty').not().isEmpty(),
],
    (req, res, next) => {

        const title = req.body.title;
        let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
        if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

        // const errors = req.validationResult();

        let errors = validationResult(req);

        if (!errors.isEmpty())

            res.render('admin/add_categories', { title: title, slug: slug, errors: errors.array() });
        else {
            Category.findOne({ 'slug': slug }, (err, category) => {
                if (category) {
                    req.flash('danger', 'category slug already exists!');

                    res.render('admin/add_categories', { title: title, slug: slug });
                } else {
                    let category = new Category({
                        title: title,
                        slug: slug,

                    });

                    category.save(err => {
                        if (err) return err;
                        else {
                            Category.find({}).then(categories => {

                                req.app.locals.categories = categories;
                                req.flash('success', 'category added');
                                res.redirect('/admin/categories');
                            }).catch(err => console.log(err));

                        }
                    });
                }
            });

        }

    });


//GET Edit Category
route.get('/edit-category/:id', (req, res, next) => {
    Category.findById(req.params.id).
        then(category => {

            res.render('admin/edit_category', { title: category.title, slug: category.slug, id: category._id });
        }).
        catch(error => console.log(error));

});
//POST Edit category
route.post('/edit-category/:id', [

    check('title', 'title must not be empty').not().isEmpty(),

],
    (req, res, next) => {

        const title = req.body.title;
        let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
        if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
        const id = req.params.id;
        // const errors = req.validationResult();

        let errors = validationResult(req);

        if (!errors.isEmpty())

            res.render('admin/edit_category', { title: title, slug: slug, id: id, errors: errors.array() });
        else {
            Category.findOne({ 'slug': slug, '_id': { '$ne': id } }, (err, category) => {
                if (category) {
                    req.flash('danger', 'category does not exists!');

                    res.render('admin/edit_category', { title: title, slug: slug, id: id });
                } else {
                    Category.findById(id).then(category => {

                        category.title = title;
                        category.slug = slug,



                            category.save().then(done => {
                                Category.find({}).then(categories => {

                                    req.app.locals.categories = categories;
                                    req.flash('success', 'category edited successfully');
                                    res.redirect('/admin/categories');
                                }).catch(err => console.log(err));

                            }).catch(err => {
                                console.log(error)
                            });
                    })
                        .catch(err => console.log(err))

                }
            });

        }

    });
//Delete page
route.get('/delete-category/:id', (req, res, next) => {
    Category.findByIdAndDelete({ '_id': req.params.id }).
        then(category => {
            Category.find({}).then(categories => {

                req.app.locals.categories = categories;

                req.flash('success', 'category deleted');
                res.redirect('/admin/categories');
            }).catch(err => console.log(err));

        }).
        catch(error => console.log(error));

});
module.exports = route;