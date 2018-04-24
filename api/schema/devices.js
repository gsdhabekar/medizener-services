'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Devices schema definitions
var DeviceSchema = new Schema({
	'model' : { type:String },
	'platform' : { type:String },
	'uuid' : { type:String },
	'version' : { type:String },
	'registrationToken' : { type:String },
	'status': { type: Boolean, default : true },
	'created': { type: Date , default: Date.now()}
});

module.exports = mongoose.model('devices', DeviceSchema);  