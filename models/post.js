const mongoose = require('mongoose');
const { Schema } = mongoose;
const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	author: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	time: {
		type: Date,
		required: true,
	},
});

module.exports = mongoose.model('post', postSchema);
