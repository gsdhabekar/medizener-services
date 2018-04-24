'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Helps schema definitions
var HelpSchema = new Schema({
	'title': { 
		type: String,
		required: [true, 'Title is required!'] 
	},
	'content': { 
		type: String,
		required: [true, 'Content is required!'] 
	},
	'status': { type: Boolean, default : true },
	'is_deleted': { type: Boolean, default : false },
	'created': { type: Date , default: Date.now()},
	'modified': { type: Date }
});

module.exports = mongoose.model('helps', HelpSchema);  