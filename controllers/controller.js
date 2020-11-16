const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { strategy } = require('../auth');

passport.use(strategy);

const index = function (req, res, next) {
	const flash = req.flash();
	const errors = [];
	if (flash.errors) {
		flash.errors.forEach((err) => {
			errors.push({ msg: err });
		});
	}
	Post.find()
		.populate('author')
		.exec((err, posts) => {
			if (err) {
				return next(err);
			} else {
				res.render('index', {
					title: 'Home',
					posts,
					user: res.locals.currentUser,
					errors,
				});
			}
		});
};

const sign_up_get = (req, res, next) => {
	res.render('sign_up', { title: 'Sign up' });
};

const sign_up_post = [
	body('firstName', 'First name required').trim().isLength({ min: 1 }).escape(),
	body('lastName', 'Last name required').trim().isLength({ min: 1 }).escape(),
	body('email', 'Please provide valid email address').trim().escape().isEmail(),
	body('password', 'Password must be at least 8 characters long')
		.trim()
		.isLength({ min: 8 })
		.escape(),
	async (req, res, next) => {
		const errors = validationResult(req);
		const userFound = await User.findOne(
			{ userName: req.body.email },
			(err, user) => {
				if (err) {
					return next(err);
				}
				if (user) {
					return true;
				} else return;
			}
		);
		if (!errors.isEmpty() || userFound) {
			if (userFound) {
				errors.errors.push({
					value: '',
					msg: 'That email is already associated with an account',
					param: 'userName',
					location: 'body',
				});
			}
			res.render('sign_up', {
				title: 'Sign up',
				errors: errors.array(),
			});
		} else {
			const { firstName, lastName, email } = req.body;
			bcrypt.hash(req.body.password, 8, (err, hashed) => {
				if (err) {
					return next(err);
				}
				const user = new User({
					firstName,
					lastName,
					userName: email,
					password: hashed,
					membershipStatus: 'active',
				});
				user.save((err, savedUser) => {
					if (err) {
						return next(err);
					} else {
						res.redirect('/');
					}
				});
			});
		}
	},
];

const login_get = (req, res, next) => {
	const flash = req.flash();
	// check if there is a flash message, which only shows up with an error
	const check = Object.keys(flash).length;
	if (!check) {
		// no errors, render the regular login
		res.render('login', {
			title: 'Login',
		});
	} else {
		// error, show login with error message
		errors = flash.error.map((err) => {
			// put it in the same format as the validation result
			return { msg: err };
		});
		res.render('login', {
			title: 'Login',
			errors,
		});
	}
};

const login_post = [
	// sanitize data
	body('email').trim().escape().isEmail(),
	body('password').trim().escape(),
	// authenticate
	passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash: 'Invalid username or password',
	}),
	(req, res, next) => {
		res.redirect('/');
	},
];

const message_post = [
	(req, res, next) => {
		if (!res.locals.currentUser) {
			req.flash('errors', 'You must be logged in to post');
			res.redirect('/');
		} else {
			next();
		}
	},
	body('title', 'Please include a title').trim().isLength({ min: 1 }).escape(),
	body('message', 'Please include a message')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// there are errors
			Post.find()
				.populate('author')
				.exec((err, posts) => {
					if (err) {
						return next(err);
					} else {
						res.render('index', {
							title: 'Home',
							posts,
							user: res.locals.currentUser,
							errors: errors.array(),
						});
					}
				});
			return;
		}
		const { title, message } = req.body;
		const userId = res.locals.currentUser._id;
		const post = new Post({
			title,
			message,
			author: userId,
			time: Date.now(),
		});

		post.save((err, savedPost) => {
			if (err) {
				return next(err);
			} else {
				res.redirect('/');
			}
		});
	},
];

const logout = (req, res, next) => {
	req.logout();
	res.redirect('/');
};

module.exports = {
	index,
	login_get,
	sign_up_get,
	login_post,
	sign_up_post,
	message_post,
	logout,
};
