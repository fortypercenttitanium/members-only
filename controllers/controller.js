const index = function (req, res, next) {
	res.render('index', { title: 'Express' });
};
const posts = function (req, res, next) {
	res.send('Not yet implemented');
};
const sign_in = function (req, res, next) {
	res.send('Not yet implemented');
};
const sign_up = function (req, res, next) {
	res.send('Not yet implemented');
};

module.exports = {
	index,
	posts,
	sign_in,
	sign_up,
};
