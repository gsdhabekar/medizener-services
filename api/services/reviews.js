'use strict';

var ReviewModel = require('../schema/reviews.js');
var UserModel = require('../schema/users.js');
var Validator = require('../../utils/validator.js');

// Exports all reviews controllers
module.exports = {
	// review operations
	getReviews: getReviews,
	addReviews: addReviews,
	deleteReviewById: deleteReviewById,
	getReviewById: getReviewById,
	updateReviewById: updateReviewById
};

/**
 * Add new review of user
 *
 * @param {Schema} Review data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/reviews
 */
function addReviews(data, callback) {
	ReviewModel.findOne({ 'user_id': data.user_id, 'feedback_id': data.feedback_id }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('Feedback is already saved!');
			} else {
				UserModel.findOne({ '_id': data.user_id }, function (err, user) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						if (user) {
							if (parseInt(user.rating) !== 0) {
								user.rating = Math.round((parseInt(user.rating) + data.rating) / 2).toString();
							} else {
								user.rating = data.rating.toString();
							}
							// update rating for user
							user.save(function (err) {
								if (err) {
									return callback(Validator.isMongoErr(err));
								} else {
									var _record = new ReviewModel(data);
									// save review record
									_record.save(function (err) {
										if (err) {
											return callback(Validator.isMongoErr(err));
										} else {
											return callback(null, 'Feedback is successfully added.');
										}
									});
								}
							})
						} else {
							return callback('User is not found.');
						}
					}
				});
			}
		}
	});
}

/**
 * Get all reviews of user
 *
 * @param {Schema} Review data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/reviews
 */
function getReviews(params, callback) {
	ReviewModel.find(params.query, params.fields)
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
 * Get individual review of user
 *
 * @param {Schema} Review Id
 * @param {Object obj Object to cast}
 * @api GET /api/v1/reviews
 */
function getReviewById(params, callback) {
	ReviewModel.findOne(params.query, params.fields)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Update review of user
 *
 * @param {Schema} Review object
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/reviews
 */
function updateReviewById(params, callback) {
	ReviewModel.update(params.query, { $set: params.data })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Feedback is updated successfully.');
			}
		});
}

/**
 * Delete review of user
 *
 * @param {Schema} Review id
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/reviews
 */
function deleteReviewById(params, callback) {
	ReviewModel.remove(params.query, function (err) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			return callback(null, 'Feedback is deleted successfully.');
		}
	});
}