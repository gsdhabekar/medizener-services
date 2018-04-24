'use strict';

var CryptoJS = require("crypto-js");
var UserModel = require('../schema/users.js');
var Validator = require('../../utils/validator.js');
var _CONST = require('../../config/resources.js');
var Mailer = require('../../config/mailer.js');
var ComponentModel = require('../schema/components.js');
var _USER_KEYS = 'first_name last_name type email interval_time available_time fees';
// Exports all users services
module.exports = {
	getUsers: getUsers,  // Get all users listing
	addUsers: addUsers,   // add new user into database
	deleteUserById: deleteUserById, // delete individual user
	getUserById: getUserById, // Get individual user info
	updateUserById: updateUserById // Update user info
};


/**
 * Add new user into medizener
 *
 * @param {Schema} User Schema
 * @param {Object obj Object to cast}
 * @api /api/v1/users
 */
function addUsers(data, callback) {
	var _record = new UserModel(data);
	UserModel.findOne({ 'email': _record.email }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('User is already exists.');
			} else {
				var email = _record.email.split('@');
				_record.password = _record.generateHash(_record.password);
				_record.username = email[0];
				// Save new record
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						// if user is doctor then send mail to admin for approval
						if (_record.type === 'doctor') {
							sendApprovalMail(_record.email);
						}
						// Encrypt 
						var ciphertext = CryptoJS.AES.encrypt(JSON.stringify({
							'email': _record.email,
							'type': 'email'
						}), _CONST.privateKey);
						var _URL = _CONST.verify.url + encodeURIComponent(ciphertext.toString());
						var html = '';
						// html encode and decode url
						ComponentModel.findOne({ 'type': 'email' })
							.exec(function (err, _data) {
								if (err) {
									html = '<p> Content unavailable, Please click here <a target="_blank" href="' + _URL + '">Verify Email</a></p>';
								} else {
									if (_data && _data.content && _data.content.email_verify) {
										html = _data.content.email_verify.replace("[[verification_link]]", _URL);
									} else {
										html = '<p> Content unavailable, Please click here <a target="_blank" href="' + _URL + '">Verify Email</a></p>';
									}
								}
								// Message body object
								var message = {
									'email': _record.email,
									'subject': 'Email Verification',
									'html': html
								};
								// Send email using mailer
								Mailer.sendMail(message, function (err, result) {
									return callback(null, 'Registration Complete! Please check your email account to verify.', _record._id);
								});
							});
					}
				});
			}
		}
	});
}

/**
 * @param User email address
 * @return send's mail to admin mail
 */
function sendApprovalMail(email) {
	// Encrypt 
	var ciphertext = CryptoJS.AES.encrypt(JSON.stringify({
		'email': email,
		'type': 'verify_doctor'
	}), _CONST.privateKey);
	var _URL = _CONST.verify.url + encodeURIComponent(ciphertext.toString());
	var html = '';
	// html encode and decode url
	ComponentModel.findOne({ 'type': 'email' })
		.exec(function (err, _data) {
			if (err) {
				html = '<p> Content unavailable, Please click here <a target="_blank" href="' + _URL + '">Approve</a></p>';
			} else {
				if (_data && _data.content && _data.content.verify_doctor_template) {
					html = _data.content.verify_doctor_template.replace("[[approve_link]]", _URL);
				} else {
					html = '<p> Content unavailable, Please click here <a target="_blank" href="' + _URL + '">Approve</a></p>';
				}
			}
			// Message body object
			var message = {
				'email': _CONST.adminEmail,
				'subject': 'Approve User Account',
				'html': html
			};
			// Send email using mailer
			Mailer.sendMail(message, function (err, result) {
				if (err) {
					console.log("Unable to send email!");
				} else {
					console.log('Approval mail sent successfully.');
				}
			});
		});
}

/**
 * Get users queries
 *
 * @param Users schema
 * @param Query params 
 * @api /api/v1/users
 */
function getUsers(params, callback) {
	UserModel.find(params.query, params.fields)
		.limit(params.limit)
		.sort(params.sort)
		.skip(params.skip)
		.populate('user_id', _USER_KEYS)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Handles individual user queries
 *
 * @param Users schema
 * @param query object
 * @api GET /api/v1/users/{user_id}
 */
function getUserById(params, callback) {
	UserModel.findOne(params.query, params.fields)
		.populate('user_id', _USER_KEYS)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Handles update operation
 *
 * @param Users schema
 * @param User object 
 * @api PUT /api/v1/users/{user_id}
 */
function updateUserById(params, callback) {
	if (params.action) {
		UserModel.findOne(params.query)
			.exec(function (err, result) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					if (result) {
						switch (params.action) {
							case 'password': {
								if (result.campareHash(params.body.old_password)) {
									UserModel.update(params.query, { $set: { 'password': result.generateHash(params.body.new_password) } })
										.exec(function (err) {
											if (err) {
												return callback(Validator.isMongoErr(err));
											} else {
												return callback(null, 'Password is updated successfully.');
											}
										});
								} else {
									return callback('Incorrect Password! Please enter correct password.');
								}
								break;
							}
							case 'address': {
								switch (params.body.subtype) {
									case 'add': {
										result.address.push({
											'address_type': params.body.address_type ? params.body.address_type : undefined,
											'address1': params.body.address1 ? params.body.address1 : undefined,
											'address2': params.body.address2 ? params.body.address2 : undefined,
											'city': params.body.city ? params.body.city : undefined,
											'state': params.body.state ? params.body.state : undefined,
											'postal_code': params.body.postal_code ? parseInt(params.body.postal_code) : undefined,
											'status': true
										});
										// add new address data
										result.save(function (err) {
											if (err) {
												return callback(Validator.isMongoErr(err));
											} else {
												return callback(null, 'Address is added successfully.');
											}
										});
										break;
									}
									case 'update': {
										if (params.body.subId) {
											var _address = result.address.id(params.body.subId);
											_address = {
												'address_type': params.body.address_type ? params.body.address_type : _address.address_type,
												'address1': params.body.address1 ? params.body.address1 : _address.address1,
												'address2': params.body.address2 ? params.body.address2 : _address.address2,
												'city': params.body.city ? params.body.city : _address.city,
												'state': params.body.state ? params.body.state : _address.state,
												'postal_code': params.body.postal_code ? parseInt(params.body.postal_code) : _address.postal_code,
												'status': true
											};
											result.address.id(params.body.subId).set(_address);
											// update address data
											result.save(function (err) {
												if (err) {
													return callback(Validator.isMongoErr(err));
												} else {
													return callback(null, 'Address is updated successfully.');
												}
											});
										} else {
											return callback('Address Id is required.');
										}
										break;
									}
									case 'delete': {
										if (result.address.length >= 1 && params.body.subId) {
											result.address.id(params.body.subId).remove();
											// update address data
											result.save(function (err) {
												if (err) {
													return callback(Validator.isMongoErr(err));
												} else {
													return callback(null, 'Address is deleted successfully.');
												}
											});
										} else {
											return callback('Address Id is required.');
										}
										break;
									}
								}
								break;
							}
							default: {
								return callback('Invalid action value.');
							}
						}
					} else {
						return callback('User is not found.');
					}
				}
			});
	} else {
		UserModel.update(params.query, params.set)
			.exec(function (err) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					return callback(null, 'User is updated successfully.');
				}
			});
	}
}

/**
 * Handles delete operation
 *
 * @param id of user
 * @param return result message
 * @api DELETE /api/v1/users/{user_id}
 */
function deleteUserById(_id, callback) {
	UserModel.update({ '_id': _id }, { $set: { 'is_deleted': true } })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'User is deleted successfully.');
			}
		});
}