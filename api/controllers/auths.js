'use strict';

var path = require('path');
var fs = require('fs');
var CryptoJS = require('crypto-js');
var AuthService = require('../services/auths.js');
var Validator = require('../../utils/validator.js');
var _CONST = require('../../config/resources.js');
var UserService = require('../services/users.js');

// Exports all users controller
module.exports = {
	authenticate: authenticate,
	status: status,
	forgot: forgot,
	reset: reset,
	verify: verify,
	action: action
};

/**
 * Handles auth operation
 *
 * @param email and password of user
 * @param return result data
 * @api GET /api/v1/authenticate
 */
function authenticate(req, res) {
	var _data = req.swagger.params;
	if (Validator.isJSON(_data) && Validator.isDefined(_data.email.value) && Validator.isDefined(_data.password.value) && Validator.isDefined(_data.type.value)) {
		AuthService.authenticate(_data, function (err, result) {
			if (err) {
				res.jsonp({ "code": 401, "message": err }).status(401);
			} else {
				res.jsonp({ "code": 200, "message": "Authentication Success!", "data": result }).status(200);
			}
		});
	} else {
		res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
	}
}

/**
 * @calls specific action based on request action
 * @Handles user authentication 
 * @api GET /api/v1/authenticate/{action} 
 */
function action(req, res) {
	var action = req.swagger.params.action.value;
	var _arr = ['me', 'status', 'logout'];
	var _case = _arr[_arr.indexOf(action)];
	// call specific action function
	switch (action) {
		case _case: {
			status(req, res);
			break;
		}
		case 'forgot': {
			forgot(req, res);
			break;
		}
		case 'verify': {
			verify(req, res);
			break;
		}
		case 'reset': {
			reset(req, res);
			break;
		}
		default: {
			res.jsonp({ "code": 401, "message": "Action is required." }).status(401);
		}
	}
}

/**
 * Handles authentication status
 *
 * @api GET /api/v1/authenticate/status
 */
function status(req, res) {
	var _data = req.swagger.params;
	if (Validator.isJSON(_data) && Validator.isDefined(_data.status.value)) {
		var type = _data.status.value;
		// user status based on type
		if (type === 'logout' || type === 'status' || type === 'me') {
			if (Validator.isDefined(req.headers) && Validator.isDefined(req.headers.authorization)) {
				var parts = req.headers.authorization.split(' ');
				if (parts.length == 2) {
					AuthService[type](type, parts[1], function (err, result) {
						if (err) {
							res.jsonp({ "code": 401, "message": err }).status(401);
						} else {
							res.jsonp({ "code": 200, "message": "User authentication status!", "data": result }).status(200);
						}
					});
				} else {
					res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
				}
			} else {
				res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
			}
		} else {
			res.jsonp({ "code": 401, "message": "Please enter valid type!" }).status(401);
		}
	} else {
		res.jsonp({ "code": 401, "message": "Type is required!" }).status(401);
	}
}

/**
 * Handles forgot password
 *
 * @api GET /api/v1/authenticate/forgot
 */
function forgot(req, res) {
	var _data = req.swagger.params;
	if (Validator.isJSON(_data) && Validator.isDefined(_data.email.value)) {
		var params = {
			'email': _data.email.value,
			'url': _CONST.reset.url
		};
		AuthService.forgot(params, function (err, result) {
			if (err) {
				res.jsonp({ "code": 401, "message": "Unable to send email." }).status(401);
			} else {
				res.jsonp({ "code": 200, "message": "Reset password link is send to your registered email address." }).status(200);
			}
		});
	} else {
		res.jsonp({ "code": 401, "message": "Email is required!" }).status(401);
	}
}

/**
 * Handles reset password
 *
 * @api GET /api/v1/authenticate/reset
 */
function reset(req, res) {
	var _data = req.swagger.params;
	if (Validator.isJSON(_data) && Validator.isDefined(_data.token.value) && Validator.isDefined(_data.password.value)) {
		// Decrypt
		var bytes = CryptoJS.AES.decrypt(_data.token.value, _CONST.privateKey);
		var decrypt = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		decrypt.password = _data.password.value;
		// check expiry time of link
		if (decrypt.exp >= Date.now()) {
			AuthService.reset(decrypt, function (err, result) {
				if (err) {
					res.jsonp({ "code": 401, "message": err }).status(401);
				} else {
					res.jsonp({ "code": 200, "message": result }).status(200);
				}
			});
		} else {
			res.jsonp({ "code": 401, "message": "Reset password link is expired." }).status(401);
		}
	} else {
		res.jsonp({ "code": 401, "message": "Token is required!" }).status(401);
	}
}

/**
 * Handles verify email
 *
 * @api GET /api/v1/authenticate/verify
 */
function verify(req, res) {
	var _data = req.swagger.params;
	if (Validator.isJSON(_data) && Validator.isDefined(_data.token.value)) {
		// Decrypt
		var bytes = CryptoJS.AES.decrypt(_data.token.value, _CONST.privateKey);
		var decrypt = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		var setVal = (decrypt.type === 'email') ? { 'status': true } : { 'verified': true }; 
		var params = {
			query: { 'email': decrypt.email },
			set: { $set: setVal }
		};
		// update user information
		UserService.updateUserById(params, function (err, result) {
			if (err) {
				res.jsonp({ "code": 401, "message": err }).status(401);
			} else {
				res.jsonp({ "code": 200, "message": result }).status(200);
			}
		});
	} else {
		res.jsonp({ "code": 401, "message": "Token is required!" }).status(401);
	}
}