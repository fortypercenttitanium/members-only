const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const exhbs = require('express-handlebars');
const helpers = require('./helpers');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const { strategy, serialize, deserialize } = require('./auth');
const {
	allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

const app = express();

passport.use(strategy);

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;

// test connection to database
db.once('open', () => {
	console.log('MongoDB connection successful!');
});

// handle db errors
db.on('error', (err) => {
	console.error.bind(console, 'MongoDB connection error');
});

// view engine setup
app.engine(
	'.hbs',
	exhbs({
		extname: '.hbs',
		helpers,
	})
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

passport.serializeUser(serialize);

passport.deserializeUser(deserialize);
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const logStream = fs.createWriteStream(path.join(__dirname, 'logs.txt'));
app.use(logger('dev', { stream: logStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404, 'Page not found'));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
