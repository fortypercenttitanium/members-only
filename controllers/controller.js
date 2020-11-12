const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const index = function (req, res, next) {
	const posts = Post.find()
		.populate('author')
		.exec((err, posts) => {
			if (err) {
				return next(err);
			} else {
				res.render('index', { title: 'Home', posts, user: req.body.user });
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
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('sign_up', { title: 'Sign up', errors: errors.array() });
		} else {
			const { firstName, lastName, email } = req.body;
			const hashedPassword = bcrypt.hash(
				req.body.password,
				8,
				(err, hashed) => {
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
				}
			);
		}
	},
];

const login_get = (req, res, next) => {
	res.render('login', { title: 'Login' });
};

const login_post = (req, res, next) => {
	res.send('Sign in post');
};

const message_post = [
	(req, res, next) => {
		if (!res.locals.currentUser) {
			const err = new Error('You must be logged in to post');
			err.status = 401;
			return next(err);
		}
	},
	body('title', 'Please include a title').trim().isLength({ min: 1 }).escape(),
	body('message', 'Please include a message')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		const { title, message } = req.body;
		const { userId } = res.locals.currentUser._id;
		const post = {
			title,
			message,
			author: userId,
			time: Date.now(),
		};
	},
];

module.exports = {
	index,
	login_get,
	sign_up_get,
	login_post,
	sign_up_post,
	message_post,
};
