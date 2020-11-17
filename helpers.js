const { formatRelative } = require('date-fns');

module.exports = {
	format_date: function (date) {
		return formatRelative(date, Date.now());
	},
	showButton: function (user) {
		return user ? 'display: block;' : 'display: none;';
	},
	authorName: function (user, post) {
		return user
			? post.author.firstName + ' ' + post.author.lastName
			: 'Anonymous';
	},
};
