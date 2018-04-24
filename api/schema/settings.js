'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Settings schema definitions
var SettingSchema = new Schema({
	'user_id': {
		type: Schema.Types.ObjectId,
		ref: 'users',
		required: [true, 'User id is required!']
	},
	'notification': {
		type: Boolean, default: true
	},
	'location': {
		lat: { type: String },
		lng: { type: String }
	},
	'status': { type: Boolean, default: true },
	'is_deleted': { type: Boolean, default: false },
	'created': { type: Date, default: Date.now() },
	'modified': { type: Date }
});

module.exports = mongoose.model('settings', SettingSchema);  