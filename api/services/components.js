'use strict';

var ComponentModel = require('../schema/components.js');
var Validator = require('../../utils/validator.js');

// Exports all components services
module.exports = {
	getComponents: getComponents,  // Get all components listing
	addComponents: addComponents,   // add new components into database
	getComponentById: getComponentById, // Get individual components info
	updateComponentById: updateComponentById, // Update components info
	deleteComponentById: deleteComponentById // delete individual components
};


/**
 * Add new component into medizener
 *
 * @param Component Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/components
 */
function addComponents(data, callback) {
	ComponentModel.findOne({ 'name': data.name }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('Component is already saved!');
			} else {
				var _record = new ComponentModel(data);
				// save component record
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						return callback(null, 'Component is successfully added.');
					}
				});
			}
		}
	});
}

/**
 * get all components list
 *
 * @param Component Schema
 * @api GET /api/v1/components
 */
function getComponents(params, callback) {
	ComponentModel.find(params.query, params.fields)
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
 * Get individual component details
 *
 * @param Component Schema
 * @api GET /api/v1/components/{component_id}
 */
function getComponentById(params, callback) {
	ComponentModel.findOne(params.query, params.fields)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Update individual component details
 *
 * @param Component Schema
 * @api PUT /api/v1/components
 */
function updateComponentById(params, callback) {
	ComponentModel.update(params.query, { $set: params.data })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Component is updated successfully.');
			}
		});
}

/**
 * Delete individual component details
 *
 * @param Component Schema
 * @api DELETE /api/v1/components
 */
function deleteComponentById(params, callback) {
	ComponentModel.remove(params.query, function (err) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			return callback(null, 'Component is deleted successfully.');
		}
	});
}