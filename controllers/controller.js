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
		const {title, message} = req.body
		const { userName, id } = res.locals.currentUser;
		const post = {
			title,
			message
		}
		//todo
		User.findByIdAndUpdate(id, {posts: })
	},
];

const sign_in = function (req, res, next) {
	res.send('Not yet implemented');
};
const sign_up = function (req, res, next) {
	res.send('Not yet implemented');
};

module.exports = {
	index,
	sign_in,
	sign_up,
	message_post
};
