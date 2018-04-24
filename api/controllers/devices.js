'use strict';

var DeviceService = require('../services/devices.js');
var Validator = require('../../utils/validator.js');

// Exports all reviews controllers
module.exports = {
  // device operations
  getDevices: getDevices,
  addDevices: addDevices,
  updateDeviceById: updateDeviceById
};

/**
 * Add new device
 *
 * @param {Schema} Device data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/devices
 */
function addDevices(req, res) {
  var data = req.body;
  // check for required values of device
  if (Validator.isDefined(data) && Validator.isDefined(data.uuid)) {
    // Add new device
    DeviceService.addDevices(data, function (err, result) {
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
 * Get all devices
 *
 * @param {Schema} Device data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/devices
 */
function getDevices(req, res) {
  var query = req.swagger.params.query.value || '(status=true)';
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
  var platform = req.swagger.params.platform.value || undefined;
  // Query and sorts object
  var _queries = Validator.defineObject(query); // query object
  var _sorts = Validator.defineObject(sort);  // sorting object
  // platform of device
  if (Validator.isDefined(platform))
    _queries.platform = platform;
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
    fields: _fields,
    limit: limit,
    sort: _sorts,
    skip: skip
  };

  // Get all devices information
  DeviceService.getDevices(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
    }
  });
}

/**
 * Update individual devices details
 *
 * @param Device Schema
 * @api PUT /api/v1/devices
 */
function updateDeviceById(req, res) {
  var device_id = req.swagger.params.device_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + device_id + ')';
  var _queries = Validator.defineObject(query); // query object
  _queries._id = device_id;
  req.body.modified = new Date();
  // check for device_id and request body
  if (Validator.isDefined(device_id) && Validator.isDefined(req.body)) {
    var params = {
      query: _queries,
      data: req.body
    };
    // update devices 
    DeviceService.updateDeviceById(params, function (err, result) {
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