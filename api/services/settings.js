'use strict';

var SettingModel = require('../schema/settings.js');
var Validator = require('../../utils/validator.js');

// Exports all settings controllers
module.exports = {
	// Setting operations
	getSettings: getSettings,
	addSettings: addSettings,
	getSettingById: getSettingById,
	updateSettingById: updateSettingById
};

/**
 * Add new setting of user
 *
 * @param {Schema} setting data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/settings
 */
function addSettings(data, callback) {
	SettingModel.findOne({ 'user_id': data.user_id }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('Setting is already saved!');
			} else {
				var _record = new SettingModel(data);
				// save setting record
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						return callback(null, 'Setting is successfully added.');
					}
				});
			}
		}
	});
}

/**
 * Get all settings of user
 *
 * @param {Schema} Setting data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/settings
 */
function getSettings(params, callback) {
	SettingModel.find(params.query, params.fields)
		.limit(params.limit)
		.sort(params.sort)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Get individual setting of medizener
 *
 * @param {Schema} setting Id
 * @param {Object obj Object to cast}
 * @api GET /api/v1/settings
 */
function getSettingById(params, callback) {
	SettingModel.findOne(params.query, params.fields)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Update setting of medizener
 *
 * @param {Schema} setting object
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/settings
 */
function updateSettingById(params, callback) {
	SettingModel.update(params.query, { $set: params.data })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Setting is updated successfully.');
			}
		});
}