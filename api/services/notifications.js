'use strict';

var Admin = require("firebase-admin"); // Google push notifications
var NotificationModel = require('../schema/notifications');
var Validator = require('../../utils/validator.js');
var serviceAccount = require("../../config/serviceAccountKey.json");
var _CONFIG = require("../../config/google-services.json");
var _USER_KEYS = 'profile first_name last_name prefix email phone_number rating';

// Exports all notifications services 
module.exports = {
  sendMessage: sendMessage,
  notificationQuery: notificationQuery
};

// Initialization of notification admin
Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: _CONFIG.project_info.firebase_url
});

/**
 * Send push notifications  
 *
 * @param Notification Schema
 * @param {Object obj Object to cast}
 * @api /api/v1/notifications
 */
function sendMessage(query, callback) {
  var registrationToken = query.registrationToken;
  var messageBody = {
    notification: {
      title: query.title,
      body: query.message
    }
  };

  // send push notification to device or topic
  switch (query.source) {
    case 'device': {
      // Send a message to the device corresponding to the provided
      Admin.messaging().sendToDevice(registrationToken, messageBody)
        .then(function (res) {
          if (Array.isArray(res.results) && res.results[0].error) {
            return callback("Failed");
          } else {
            return callback(null, "Success");
          }
        })
        .catch(function (err) {
          return callback(err);
        });
      break;
    }
    case 'topic': {
      // Send a message to topic corresponding to the provided
      Admin.messaging().sendToTopic(registrationToken, messageBody)
        .then(function (res) {
          return callback(null, res);
        })
        .catch(function (err) {
          return callback(err);
        });
      break;
    }
  }
}

/**
 * Notification query   
 *
 * @param Notification Schema
 * @param {Object obj Object to cast}
 * @api /api/v1/notifications
 */
function notificationQuery(params, callback) {
  switch (params.method) {
    case 'GET': {
      NotificationModel.find(params.query, params.fields)
        .limit(params.limit)
        .sort(params.sort)
        .skip(params.skip)
        .populate('sender_id', _USER_KEYS)
        .populate('receiver_id', _USER_KEYS)
        .exec(function (err, result) {
          if (err) {
            return callback(Validator.isMongoErr(err));
          } else {
            return callback(null, result);
          }
        });
      break;
    }
    case 'POST': {
      NotificationModel.findOne(params.data, function (err, result) {
        if (err) {
          return callback(Validator.isMongoErr(err));
        } else {
          if (result) {
            return callback('Notification is already added!');
          } else {
            var _record = new NotificationModel(params.data);
            // save device record
            _record.save(function (err) {
              if (err) {
                return callback(Validator.isMongoErr(err));
              } else {
                var query = {
                  registrationToken: params.data.registrationToken,
                  title: params.data.title,
                  message: params.data.message,
                  source: 'device'
                };
                // Call send notification function
                sendMessage(query, function (err, status) {
                  if (err) {
                    return callback("Failed to send notifications!");
                  } else {
                    return callback(null, "Notification sent successfully.");
                  }
                })
              }
            });
          }
        }
      });
      break;
    }
    case 'PUT': {
      NotificationModel.update(params.query, { $set: params.data })
        .exec(function (err) {
          if (err) {
            return callback(Validator.isMongoErr(err));
          } else {
            return callback(null, 'Notification is updated successfully.');
          }
        });
      break;
    }
  }
}