const post = require('../models/post');
const user = require('../models/user');

const index = function (req, res, next) {
	res.render('index', { title: 'Posts', messages });
};
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
};
