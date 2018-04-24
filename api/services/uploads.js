'use strict';

var shortid = require('shortid');
var AWS = require('aws-sdk');
var UserModel = require('../schema/users.js');
var Validator = require('../../utils/validator.js');
var CONFIG = require('../../config/resources.js');

// Exports all uploads services
module.exports = {
	uploadMedia: uploadMedia
};

// update aws access keys
AWS.config.update({
	accessKeyId: CONFIG.AWS.ACCESS_KEY_ID,
	secretAccessKey: CONFIG.AWS.SECRET_ACCESS_KEY
});
// Initiate S3 Bucket
var S3 = new AWS.S3({
	apiVersion: CONFIG.S3.apiVersion,
	endpoint: CONFIG.S3.endpoint
});

/**
 * Upload media file for user
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/uploads
 */
function uploadMedia(req, data, callback) {
	UserModel.findOne({ '_id': data.user_id }, function (err, result) {
		if (err) {
			return callback(err.message);
		} else {
			if (result) {
				var image = data.image[0];
				// check for user specific upload
				if (data.type === 'profile') {
					save();
				} else {
					if (result.type === 'doctor' && (data.type === 'degree_certificate' || data.type === 'extra_certificate' || data.type === 'medical_reg_certificate' || data.type === 'business_card')) {
						save();
					} else {
						return callback("Not a valid user!");
					}
				}
				// save upload data
				function save() {
					// Remove existing file 
					isExist(result, data.type, function (err, status) {
						// uploadDocument to buffer into image file and save upload file path
						uploadDocument(image, CONFIG.S3.BUCKET_NAME, function (err, res) {
							if (err) {
								return callback("Failed to upload file!");
							} else {
								result[data.type] = res.url;
								result.save(function (err) {
									if (err) {
										return callback(err.message);
									} else {
										var path = {
											'name': res.key,
											'path': res.url
										};
										return callback(null, path);
									}
								});
							}
						});
					});
				}
			} else {
				return callback("User does not exist!");
			}
		}
	});
}

/**
 * Upload media file to S3 bucket
 * @param Users Schema
 * @param {Object obj Object to cast}
 */
function uploadDocument(file, BUCKET_NAME, callback) {
	if (file && file.size < 5242881) {
		var remoteFilename = shortid.generate();
		S3.putObject({
			ACL: 'public-read',
			Bucket: BUCKET_NAME,
			Key: remoteFilename,
			Body: file.buffer,
			ContentType: file.mimetype
		}, function (err, resp) {
			if (err) {
				return callback(err);
			} else {
				var url = getBucketUrl(remoteFilename, BUCKET_NAME);
				var response_data = {
					url: url,
					key: remoteFilename,
					size: file.size
				};
				return callback(null, response_data);
			}
		});
	} else {
		return callback('Upload document must be less than 5 MB.');
	}
}

/**
 * [getBucketUrl get bucket url for given filname]
 * @param  {string} fileName
 * @param  {string} bucketName
 * @return URL of s3 bucket
 */
function getBucketUrl(fileName, bucketName) {
	var fileUrl = CONFIG.S3.endpoint + bucketName + "/" + fileName;
	return fileUrl;
}

/**
 * Check for existing file
 * @param  {string} user object
 * @return Boolean value
 */
function isExist(user, type, callback) {
	if (user[type]) {
		var _str = user[type].split('/');
		var _name = _str[_str.length - 1];
		// Remove object from s3 bucket
		S3.deleteObject({
			Bucket: CONFIG.S3.BUCKET_NAME,
			Key: _name
		}, function (err, data) {
			return callback(null, true);
		});
	} else {
		return callback(null, true);
	}
}