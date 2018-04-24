'use strict';

var HelpModel = require('../schema/helps.js');
var Validator = require('../../utils/validator.js');

// Exports all helps controllers
module.exports = {
	// Help operations
	getHelps: getHelps,
	addHelps: addHelps,
	deleteHelpById: deleteHelpById,
	getHelpById: getHelpById,
	updateHelpById: updateHelpById
};

/**
 * Add new help of medizener
 *
 * @param {Schema} help data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/helps
 */
function addHelps(data, callback) {
	HelpModel.findOne({ 'title': data.title }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('Help is already saved!');
			} else {
				var _record = new HelpModel(data);
				// save help record
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						return callback(null, 'Help is successfully added.');
					}
				});
			}
		}
	});
}

/**
 * Get all helps of medizener
 *
 * @param {Schema} help data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/helps
 */
function getHelps(params, callback) {
	HelpModel.find(params.query, params.fields)
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
 * Get individual help of medizener
 *
 * @param {Schema} Help Id
 * @param {Object obj Object to cast}
 * @api GET /api/v1/helps
 */
function getHelpById(params, callback) {
	HelpModel.findOne(params.query, params.fields)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Update help of medizener
 *
 * @param {Schema} help object
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/helps
 */
function updateHelpById(params, callback) {
	HelpModel.update(params.query, { $set: params.data })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Help is updated successfully.');
			}
		});
}

/**
 * Delete help of medizener
 *
 * @param {Schema} help id
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/helps
 */
function deleteHelpById(params, callback) {
	HelpModel.remove(params.query, function (err) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			return callback(null, 'Help is deleted successfully.');
		}
	});
}