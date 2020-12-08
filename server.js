'use strict';
require('dotenv').config({silent: true});

const port = process.env.PORT;

const app = require('express')();
const session = require('express-session');
const helmet = require('helmet');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const database = require('./mongodb/connection');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
    exposedHeaders: ['Authorization']
}));
database.connect();

require('./middlewares/auth')(passport);
app.use(session({
    secret: 'IntelliBoard-Intelliway',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./routes'));

app.listen(port, _ => console.log('Server running! Port', port) );