'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Components schema definitions
var ComponentSchema = new Schema({
	'name': { 
		type: String,
		required: [true, 'Name is required!'] 
	},
	'type': { 
		type: String,
		required: [true, 'Type is required!'] 
	},
	'content': { type: Schema.Types.Mixed },
	'status': { type: Boolean, default : true },
	'is_deleted': { type: Boolean, default : false },
	'created': { type: Date , default: Date.now()},
	'modified': { type: Date }
});

module.exports = mongoose.model('components', ComponentSchema);  