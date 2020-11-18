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
			errors.push(err);
		});
	}
	Post.find()
		.populate('author')
		.sort({ time: -1 })
		.exec((err, posts) => {
			if (err) {
				return next(err);
			} else {
				res.render('index', {
					title: 'Home',
					posts,
					user: res.locals.currentUser,
					errors,
					menuOpen: false,
				});
			}
		});
};

const sign_up_get = (req, res, next) => {
	res.render('sign_up', { title: 'Sign up', user: res.locals.currentUser });
};

const sign_up_post = [
	body('firstName', 'First name required').trim().isLength({ min: 1 }).escape(),
	body('lastName', 'Last name required').trim().isLength({ min: 1 }).escape(),
	body('email', 'Please provide valid email address').trim().escape().isEmail(),
	body('password', 'Password must be at least 8 characters long')
		.trim()
		.isLength({ min: 8 })
		.escape(),
	body('password-confirmation').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Password confirmation does not match password');
		} else {
			return true;
		}
	}),
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
					membershipStatus: 'guest',
				});
				user.save((err, savedUser) => {
					if (err) {
						return next(err);
					} else {
						req.login(savedUser, (err) => {
							if (err) {
								return next(err);
							}
							res.redirect('/');
						});
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
			user: res.locals.currentUser,
		});
	} else {
		// error, show login with error message
		errors = flash.errors.map((err) => {
			// put it in the same format as the validation result
			return { msg: err };
		});
		res.render('login', {
			title: 'Login',
			user: res.locals.currentUser,
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
							menuOpen: false,
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

const message_delete = (req, res, next) => {
	if (!req.user) {
		req.flash('errors', { msg: 'Please login to delete this post' });
		res.redirect('/');
		return;
	}
	const id = req.user._id;
	Post.findById(req.params.id).exec((err, post) => {
		if (err) {
			const error = new Error('Post not found');
			error.status = 404;
			return next(error);
		}
		if (
			post.author._id.toString() === id.toString() ||
			res.locals.currentUser.membershipStatus === 'admin'
		) {
			post.delete((err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/');
			});
		} else {
			req.flash('errors', {
				msg: 'You do not have permission to delete that post',
			});
			res.redirect('/');
		}
	});
};

const logout = (req, res, next) => {
	req.logout();
	res.redirect('/');
};

const secret_code_get = (req, res, next) => {
	let membershipStatus = 'visitor';
	if (res.locals.currentUser) {
		membershipStatus = res.locals.currentUser.membershipStatus;
	}
	const errors = req.flash().errors;
	res.render('secret_code', {
		title: 'Secret code',
		user: res.locals.currentUser,
		errors,
		membershipStatus,
	});
};

const secret_code_post = [
	body('secret-code', 'Please provide a secret code!').trim().escape(),
	(req, res, next) => {
		const code = req.body['secret-code'];
		const user = req.user;
		if (!user) {
			req.flash('errors', {
				msg: 'Please login before attempting to pass the test.',
			});
			res.redirect('/secret_code');
			return;
		}
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('secret_code', {
				title: 'Secret code test',
				user: res.locals.currentUser,
				errors: errors.array(),
			});
		} else {
			if (code === process.env.SECRET_CODE) {
				if (
					user.membershipStatus === 'member' ||
					user.membershipStatus === 'admin'
				) {
					req.flash('errors', { msg: 'You are already a member or admin.' });
					res.redirect('/secret_code');
				} else {
					user.membershipStatus = 'member';
					user.save((err) => {
						if (err) next(err);
					});
					req.flash('msg', { msg: 'Congrats! You are now a member!' });
					res.redirect('/redirect');
				}
			} else if (code === process.env.ADMIN_CODE) {
				if (user.membershipStatus === 'admin') {
					req.flash('errors', { msg: 'You are already an admin.' });
					res.redirect('/secret_code');
				} else {
					user.membershipStatus = 'admin';
					user.save((err) => {
						if (err) next(err);
					});
					req.flash('msg', { msg: 'Congrats! You are now an admin!' });
					res.redirect('/redirect');
				}
			} else {
				req.flash('errors', { msg: 'Incorrect secret code.' });
				res.redirect('/secret_code');
			}
		}
	},
];

const redirect = (req, res, next) => {
	const message = req.flash().msg || [];
	res.render('redirect', { message: message[0], user: res.locals.currentUser });
};

module.exports = {
	index,
	login_get,
	sign_up_get,
	login_post,
	sign_up_post,
	message_post,
	logout,
	message_delete,
	secret_code_get,
	secret_code_post,
	redirect,
};
