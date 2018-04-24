'use strict';

var AnalyticsService = require('../services/analytics.js');
var Validator = require('../../utils/validator.js');

// Exports all analytics controller 
module.exports = {
  statistics: statistics
};

/**
 * Get all statistics 
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/analytics
 */
function statistics(req, res) {
  var user_id = req.swagger.params.user_id.value;
  var type = req.swagger.params.type.value;
  var params = {};
  // check for search text
  if (Validator.isDefined(type)) {
    switch (type) {
      case 'doctor': {
        if (Validator.isDefined(user_id)) {
          params = { '_id': user_id, 'type': type };
        } else {
          res.jsonp({ "code": 401, "message": "User id is required." }).status(401);
        }
        break;
      }
      case 'patient': {
        if (Validator.isDefined(user_id)) {
          params = { '_id': user_id, 'type': type };
        } else {
          res.jsonp({ "code": 401, "message": "User id is required." }).status(401);
        }
        break;
      }
      case 'admin': {
        params = { 'type': type };
        break;
      }
      default: {
        res.jsonp({ "code": 401, "message": "Invalid user type." }).status(401);
      }
    }
    // search for statistics
    AnalyticsService.statistics(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
  }
}