'use strict';

var jwt = require('jsonwebtoken');
var CryptoJS = require("crypto-js");
var UserModel = require('../schema/users.js');
var _CONST = require('../../config/resources.js');
var Mailer = require('../../config/mailer.js');
var Validator = require('../../utils/validator.js');
var ComponentModel = require('../schema/components.js');

// Exports all users services
module.exports = {
	authenticate: authenticate,
	status: status,
	me: me,
	logout: logout,
	forgot: forgot,
	reset: reset
};

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate
 */
function authenticate(data, callback) {
	UserModel.findOne({ email: data.email.value, type: data.type.value }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				// check if doctor is verified or not
				// if (result.type === 'doctor' && !result.verified) {
				// 	return callback("Your account is not verified. In order to activate account please contact support@medizener.com");
				// }
				// check for password and status of user
				if (result.campareHash(data.password.value) && result.status && (!result.is_deleted)) {
					var token = jwt.sign({ 'id': result.id, 'type': result.type }, _CONST.privateKey, { 'expiresIn': '1d' });
					result.token = token;
					result.save(function (err) {
						if (err) {
							return callback(Validator.isMongoErr(err));
						} else {
							jwt.verify(token, _CONST.privateKey, function (err, user) {
								if (err) {
									return callback(err.message);
								} else {
									return callback(null, { 'token': token, 'iat': user.iat, 'exp': user.exp });
								}
							});
						}
					});
				} else {
					var msg = (result.status) ? "Authentication Failed! Please check your password." : "Your account is inactive. Please contact at support@gmail.com.";
					return callback(msg);
				}
			} else {
				return callback("Authentication Failed! Please check your email or password.");
			}
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate/me
 */
function status(type, auth, callback) {
	checkUserStatus(type, auth, function (err, result) {
		if (err) {
			return callback(err);
		} else {
			return callback(null, result);
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate/me
 */
function me(type, auth, callback) {
	checkUserStatus(type, auth, function (err, result) {
		if (err) {
			return callback(err);
		} else {
			return callback(null, result);
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate/me
 */
function logout(type, auth, callback) {
	jwt.verify(auth, _CONST.privateKey, function (err, user) {
		if (err) {
			return callback(err.message);
		} else {
			UserModel.update({ _id: user.id }, { $set: { 'token': undefined } })
				.exec(function (err) {
					if (err) {
						return callback(err.message);
					} else {
						return callback(null, false);
					}
				});
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 */

function checkUserStatus(type, auth, callback) {
	UserModel.findOne({ token: auth })
		.exec(function (err, user) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				if (user) {
					jwt.verify(user.token, _CONST.privateKey, function (err, user) {
						if (err) {
							return callback(err.message);
						} else {
							return callback(null, user);
						}
					});
				} else {
					return callback("User is not authorized!");
				}
			}
		});
}

/**
 * Handles forgot password
 * @params Object converted into String using toString()***
 * @api GET /api/v1/authenticate/forgot
 */
function forgot(_data, callback) {
	UserModel.findOne({ email: _data.email })
		.exec(function (err, user) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				if (user) {
					// Encrypt email address
					var ciphertext = CryptoJS.AES.encrypt(JSON.stringify({
						'email': _data.email,
						'exp': Math.floor(Date.now() + 60 * 60 * 1000)
					}), _CONST.privateKey);
					var _URL = _data.url + encodeURIComponent(ciphertext.toString());
					var html = '';
					// html encode and decode url
					ComponentModel.findOne({ 'type': 'email' })
						.exec(function (err, _result) {
							if (err) {
								html = '<p> Content unavailable, Please click here <a target="_blank" href="' + _URL + '">Set Password </a> </p>';
							} else {
								if (_result && _result.content && _result.content.forgot_password) {
									html = _result.content.forgot_password.replace("[[name]]", user.first_name)
										.replace("[[reset_link]]", _URL);
								} else {
									html = '<p> Content unavailable, Please click here <a target="_blank" href="' + _URL + '">Set Password </a> </p>';
								}
							}
							// Message body object
							var message = {
								'email': _data.email,
								'subject': 'Forgot Password',
								'html': html
							};
							// Send email using mailer
							Mailer.sendMail(message, function (err, result) {
								if (err) {
									return callback("Unable to send email!");
								} else {
									return callback(null, result);
								}
							});
						});
				} else {
					return callback("User is not authorized!");
				}
			}
		});
}

/**
 * Handles reset password
 * @params Object converted into String using toString()***
 * @api GET /api/v1/authenticate/reset
 */
function reset(_data, callback) {
	var record = new UserModel();
	// update users password
	UserModel.update({ 'email': _data.email }, { $set: { 'password': record.generateHash(_data.password) } })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Password is updated successfully.');
			}
		});
}