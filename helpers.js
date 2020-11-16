const { formatRelative } = require('date-fns');

module.exports = {
	format_date: function (date) {
		return formatRelative(date, Date.now());
	},
};
