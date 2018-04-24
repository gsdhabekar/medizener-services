'use strict';

var UploadService = require('../services/uploads.js');
var Validator = require('../../utils/validator.js');

// Exports all upload controller 
module.exports = {
  uploadMedia: uploadMedia
};

/**
 * Upload media file for user
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/uploads
 */
function uploadMedia(req, res) {
  // Validate user request
  if (Validator.isValidObject(req.body) && Validator.isDefined(req.body.user_id) && Validator.isDefined(req.body.type) && Validator.isUpload(req.body.type)
    && req.files && Validator.isDefined(req.files.image)) {
    var params = {
      'user_id': req.body.user_id,
      'type': req.body.type,
      'image': req.files.image
    };
    // Call upload media service
    UploadService.uploadMedia(req, params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({
          "code": 200, "message": "File uploaded!", "data": {
            'name': result.name,
            'path': result.path
          }
        }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
  }
}