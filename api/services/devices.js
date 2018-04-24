'use strict';

var DeviceModel = require('../schema/devices.js');
var Validator = require('../../utils/validator.js');

// Exports all devices controllers
module.exports = {
	// device operations
	getDevices: getDevices,
	addDevices: addDevices,
	updateDeviceById: updateDeviceById
};

/**
 * Add new device of medizener
 *
 * @param {Schema} device data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/devices
 */
function addDevices(data, callback) {
	DeviceModel.findOne({ 'uuid': data.uuid }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('Device ID is already exists!');
			} else {
				var _record = new DeviceModel(data);
				// save device record
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						return callback(null, 'Device is successfully added.');
					}
				});
			}
		}
	});
}

/**
 * Get all devices
 *
 * @param {Schema} device data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/devices
 */
function getDevices(params, callback) {
	DeviceModel.find(params.query, params.fields)
		.limit(params.limit)
		.sort(params.sort)
		.skip(params.skip)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Update individual devices details
 *
 * @param Device Schema
 * @api PUT /api/v1/devices
 */
function updateDeviceById(params, callback) {
	DeviceModel.update(params.query, { $set: params.data })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Device is updated successfully.');
			}
		});
}