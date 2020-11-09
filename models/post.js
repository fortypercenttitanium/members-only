const mongoose = require('mongoose');
const { Schema } = mongoose;
const postSchema = new mongoose.Schema({
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

module.exports = postSchema;
