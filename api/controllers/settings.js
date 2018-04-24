'use strict';

var SettingService = require('../services/settings.js');
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
 * Add new setting of medizener
 *
 * @param {Schema} setting data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/settings
 */
function addSettings(req, res) {
  var data = req.body;
  // check for required values of setting
  if (Validator.isDefined(data) && Validator.isDefined(data.user_id)) {
    // Add new setting of medizener
    SettingService.addSettings(data, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
  }
}

/**
 * Get all settings of user
 *
 * @param {Schema} Setting data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/settings
 */
function getSettings(req, res) {
  var query = req.swagger.params.query.value || '(status=true)';
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
  var user_id = req.swagger.params.user_id.value || undefined;
  // Query and sorts object
  var _queries = Validator.defineObject(query); // query object
  var _sorts = Validator.defineObject(sort);  // sorting object
  // user id
  _queries.user_id = user_id;
  // create fields array
  var _fields = {};
  if (field) {
    var _arr = field.split(',');
    _arr.forEach(function (arr) {
      _fields[arr] = 1;
    });
  }
  // check for review user id
  if (_queries && Validator.isDefined(_queries.user_id)) {
    // params object for db query
    var params = {
      query: _queries,
      fields: _fields,
      limit: limit,
      sort: _sorts,
      skip: skip
    };
    // Get all settings information
    SettingService.getSettings(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "user id is required!" }).status(401);
  }
}

/**
 * Get individual setting of medizener
 *
 * @param {Schema} setting Id
 * @param {Object obj Object to cast}
 * @api GET /api/v1/settings
 */
function getSettingById(req, res) {
  var field = req.swagger.params.field.value || null;
  var setting_id = req.swagger.params.setting_id.value || undefined;
  // check for setting id
  if (Validator.isDefined(setting_id)) {
    // query object
    var _queries = {};
    _queries._id = setting_id;
    // create fields array
    var _fields = {};
    if (field) {
      var _arr = field.split(',');
      _arr.forEach(function (arr) {
        _fields[arr] = 1;
      });
    }
    // params object for db query
    var params = {
      query: _queries,
      fields: _fields
    };
    // Get indivial setting information
    SettingService.getSettingById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Setting id is required!" }).status(401);
  }
}

/**
 * Update setting of medizener
 *
 * @param {Schema} setting object
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/settings
 */
function updateSettingById(req, res) {
  var setting_id = req.swagger.params.setting_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + setting_id + ')';
  var _queries = Validator.defineObject(query); // query object
  _queries._id = setting_id;
  req.body.modified = new Date();
  // check for setting id and request body
  if (Validator.isDefined(setting_id) && Validator.isDefined(req.body)) {
    var params = {
      query: _queries,
      data: req.body
    };
    // update setting 
    SettingService.updateSettingById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
  }
}