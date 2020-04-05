const express = require('express');
const request = require('request');
const http = require('http');
const debug = require("debug")("node-angular");
const path = require('path');
const mongoose = require('mongoose').set('debug', true);
const config = require('./config/database');
const ejsLint = require('ejs-lint');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');
const { initializePayment, verifyPayment } = require('./config/paystack')(request);
const passport = require('passport');
const flash = require('connect-flash')
//connecting to database
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
    //mongoose.connect(config.database, { useMongoClient: true })
    .then(() => {
        console.log('we are connected now')
    }).catch(() => {
        console.log('could not connect')
    });
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//     console.log("we're connected!");
// });

// app initialization
const app = express();
ejsLint('EJS', { async: true });
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//set global error variable
app.locals.errors = null;


//Get page model
let Page = require('./models/page');
//Get all pages and pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
    if (err) console.log(err)
    else
        app.locals.pages = pages;
});


//Get category model
let Category = require('./models/category');
//Get all category 
Category.find({}).then(categories => {

    app.locals.categories = categories;
}).catch(err => console.log(err));
//express-fileupload
app.use(fileUpload());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
// parse application/json
app.use(bodyParser.json());

// Use the session middleware
app.use(session({
    secret: 'ifymatics0296',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 14 * 24 * 60 * 60 }
}))


// validator middleware


// Express messages middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport config
require('./config/passport')(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//setting cart session
app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    res.locals.rout = req.session.rout;
    next();
});

// app Routes
const pages = require('./routes/pages');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');
const paystack = require('./routes/paystack');
const admin_pages = require('./routes/admin_pages');
const admin_categories = require('./routes/admin_categories');
const admin_products = require('./routes/admin_products');





app.use('/admin/pages', admin_pages);
app.use('/admin/categories', admin_categories);
app.use('/admin/products', admin_products);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/paystack', paystack);
app.use('/', pages);



const normalizePort = val => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};

const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ? "pipe " + port : "port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof port === "string" ? "pipe " + port : "port " + port;
    debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);


const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, '192.168.43.191')


module.exports = app;