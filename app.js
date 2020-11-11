const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const exhbs = require('express-handlebars');
const helpers = require('./helpers');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const { strategy, serialize, deserialize } = require('./auth');

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
		secret: 'oi57Vhij08hdHuygwDBu7',
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
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
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
