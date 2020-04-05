const express = require('express');
const Page = require('../models/page');

const ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const route = express.Router();


route.get('/', (req, res, next) => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        //if (pages)
        res.render('admin/pages', { title: 'Admin Area', pages: pages, brand: 'softHub' });

    });



});
route.get('/add-page', (req, res, next) => {
    const title = "";
    const slug = "";
    const content = "";
    res.render('admin/add_pages', { title: title, slug: slug, content: content, brand: 'softHub' });
});

route.post('/add-page', [
    // check('title').not().isEmpty().withMessage('title must not be empty'),
    check('title', 'title must not be empty').not().isEmpty(),
    check('content', 'content must not be empty').not().isEmpty(),
],
    (req, res, next) => {

        const title = req.body.title;
        let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
        if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
        const content = req.body.content;
        // const errors = req.validationResult();

        let errors = validationResult(req);

        if (!errors.isEmpty())

            res.render('admin/add_pages', { title: title, slug: slug, content: content, errors: errors.array() });
        else {
            Page.findOne({ 'slug': slug }, (err, page) => {
                if (page) {
                    req.flash('danger', 'Page slug already exists!');

                    res.render('admin/add_pages', { title: title, slug: slug, content: content });
                } else {
                    let page = new Page({
                        title: title,
                        slug: slug,
                        content: content,
                        sorting: 100
                    });
                    console.log(page)
                    page.save(err => {
                        if (err) return err;
                        else {
                            Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
                                if (err) console.log(err)
                                else {
                                    req.app.locals.pages = pages;
                                    req.flash('success', 'Page added');
                                    res.redirect('/admin/pages');
                                }
                            });

                        }
                    });
                }
            });

        }

    });
//sortPages function
function sortPages(ids, callback) {
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        count++;
        ((count) => {
            let Id = ids[i];

            Page.findById(Id).then(page => {

                page.sorting = count;
                page.save().then(() => {
                    ++count;
                    if (count >= ids.length) {
                        console.log('searching for appLocals')
                        callback();
                    }

                    //return page;
                }).catch(err => { console.log(err) });
                // console.log(page)

            });
        })(count)

    }

}
//re-arrange pages route

route.post('/re-arrange-pages', (req, res, next) => {
    let idArray = req.body['id[]'];

    sortPages(idArray, function () {

        Page.find({}).sort({ sorting: 1 }).exec().then((pages) => {

            console.log('searching for appLocals')
            req.app.locals.pages = pages;


        }).catch(err => console.log(err));

    });

});
//GET Edit Page
route.get('/edit-page/:id', (req, res, next) => {
    Page.findById(req.params.id).
        then(page => {
            console.log(page.content);
            res.render('admin/edit_page', { title: page.title, slug: page.slug, content: page.content, id: page._id });
        }).
        catch(error => console.log(error));

});
//POST Edit Page
route.post('/edit-page/:id', [
    // check('title').not().isEmpty().withMessage('title must not be empty'),
    check('title', 'title must not be empty').not().isEmpty(),
    check('content', 'content must not be empty').not().isEmpty(),
],
    (req, res, next) => {

        const title = req.body.title;
        let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
        if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
        const content = req.body.content;
        const id = req.params.id;
        // const errors = req.validationResult();

        let errors = validationResult(req);

        if (!errors.isEmpty())

            res.render('admin/edit_page', { title: title, slug: slug, content: content, errors: errors.array() });
        else {
            Page.findOne({ 'slug': slug, '_id': { '$ne': id } }, (err, page) => {
                if (page) {
                    req.flash('danger', 'Page does not exists!');

                    res.render('admin/edit_page/', { title: title, slug: slug, content: content, id: id });
                } else {
                    Page.findById(id).then(page => {

                        page.title = title;
                        page.slug = slug,
                            page.content = content,


                            page.save().then(done => {
                                Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
                                    if (err) console.log(err)
                                    else {
                                        req.app.locals.pages = pages;
                                        req.flash('success', 'Page edited successfully');
                                        res.redirect('/admin/pages');
                                    }

                                });

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
route.get('/delete-page/:id', (req, res, next) => {
    Page.findByIdAndDelete({ '_id': req.params.id }).
        then(page => {
            Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
                if (err) console.log(err)
                else {
                    req.app.locals.pages = pages;
                    req.flash('success', 'Page deleted');
                    res.redirect('/admin/pages');
                }
            });

        }).
        catch(error => console.log(error));

});
module.exports = route;