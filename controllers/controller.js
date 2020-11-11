const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

const index = function (req, res, next) {
	const posts = Post.find()
		.populate('author')
		.exec((err, posts) => {
			if (err) {
				return next(err);
			} else {
				res.render('index', { title: 'Home', posts });
			}
		});
};

const sign_up_get = (req, res, next) => {
	res.render('sign_up', { title: 'Sign up' });
};

const sign_up_post = (req, res, next) => {
	res.send('Sign up post');
};

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
