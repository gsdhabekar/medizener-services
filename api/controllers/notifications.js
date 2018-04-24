'use strict';

var NotificationService = require('../services/notifications.js');
var Validator = require('../../utils/validator.js');

// Exports all analytics controller 
module.exports = {
  sendMessage: sendMessage,
  updateNotification: updateNotification,
  getNotifications: getNotifications
};

/**
 * Send push notifications
 *
 * @param Notification Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/notifications
 */
function sendMessage(req, res) {
  var data = req.body;
  // check for required values of device
  if (Validator.isDefined(data) && Validator.isDefined(data.title) && Validator.isDefined(data.registrationToken)) {
    var params = {
      data: data,
      method: 'POST'
    };
    // Save notification and send notification to devices
    NotificationService.notificationQuery(params, function (err, result) {
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
 * Update notifications
 *
 * @param Notification Schema
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/notifications
 */
function updateNotification(req, res) {
  var notification_id = req.swagger.params.notification_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + notification_id + ')';
  var _queries = Validator.defineObject(query); // query object
  _queries._id = notification_id;
  req.body.modified = new Date();
  // check for notification_id and request body
  if (Validator.isDefined(notification_id) && Validator.isDefined(req.body)) {
    var params = {
      query: _queries,
      data: req.body,
      method: 'PUT'
    };
    // update notification details 
    NotificationService.notificationQuery(params, function (err, result) {
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
 * Get all notifications of sender ID 
 *
 * @param Notification Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/notifications
 */
function getNotifications(req, res) {
  var query = req.swagger.params.query.value || '()';
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
  var _queries = Validator.defineObject(query); // query object
  var _sorts = Validator.defineObject(sort);  // sorting object

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
    skip: skip,
    method: 'GET'
  };

  // Get all notification information
  NotificationService.notificationQuery(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
    }
  });
}