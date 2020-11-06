const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		length: {
			min: 1,
		},
	},
	lastName: {
		type: String,
		required: true,
		length: {
			min: 1,
		},
	},
	userName: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	membershipStatus: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('User', userSchema);
