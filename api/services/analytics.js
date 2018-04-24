'use strict';

var mongoose = require('mongoose');
var UserModel = require('../schema/users.js');
var AppointmentModel = require('../schema/appointments');
var Validator = require('../../utils/validator.js');

// Exports all analytics controller 
module.exports = {
  users: users,
  appointments: appointments,
  statistics: statistics
};

/**
 * Get all statistics 
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/analytics
 */
function statistics(data, callback) {
  var stats = {};
  var params = {};
  switch (data.type) {
    case 'doctor': {
      params = [
        { '$match': { 'user_id': mongoose.Types.ObjectId(data._id), 'is_deleted': false, 'type': { '$ne': 'doctor' } } },
        { '$group': { '_id': '$type', 'count': { '$sum': 1 } } }
      ];
      // Get users count
      users(params, function (err, count) {
        if (err) {
          stats.patients = 0;
          stats.staffs = 0;
        } else {
          stats.patients = (count.patients) ? count.patients : 0;
          stats.staffs = (count.staffs) ? count.staffs : 0;
          // get apoointments count
          params = [
            { '$match': { 'doctor_id': mongoose.Types.ObjectId(data._id), 'is_deleted': false } },
            { '$group': { '_id': '$type', 'count': { '$sum': 1 } } }
          ];
          appointments(params, function (err, count) {
            if (err) {
              stats.online_appointments = 0;
              stats.regular_appointments = 0;
              return callback(null, stats);
            } else {
              stats.online_appointments = (count.online_appointments) ? count.online_appointments : 0;
              stats.regular_appointments = (count.regular_appointments) ? count.regular_appointments : 0;
              return callback(null, stats);
            }
          });
        }
      });
      break;
    }
    case 'patient': {
      // get apoointments count
      params = [
        { '$match': { 'patient_id': mongoose.Types.ObjectId(data._id), 'is_deleted': false } },
        { '$group': { '_id': '$type', 'count': { '$sum': 1 } } }
      ];
      appointments(params, function (err, count) {
        if (err) {
          stats.online_appointments = 0;
          stats.regular_appointments = 0;
          return callback(null, stats);
        } else {
          stats.online_appointments = (count.online_appointments) ? count.online_appointments : 0;
          stats.regular_appointments = (count.regular_appointments) ? count.regular_appointments : 0;
          return callback(null, stats);
        }
      });
      break;
    }
    case 'admin': {
      // Get users count
      UserModel.count(params, function (err, count) {
        if (err) {
          stats.users = 0;
        } else {
          stats.users = count;
          return callback(null, stats);
        }
      });
      break;
    }
  }
}

/**
 * Get all users statistics 
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/analytics
 */
function users(query, callback) {
  UserModel.aggregate(query, function (err, result) {
    if (err) {
      return callback(Validator.isMongoErr(err));
    } else {
      return callback(null, Validator.getCounts('users', result));
    }
  });
}

/**
 * Get all appointments statistics 
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/analytics
 */
function appointments(query, callback) {
  AppointmentModel.aggregate(query, function (err, result) {
    if (err) {
      return callback(Validator.isMongoErr(err));
    } else {
      return callback(null, Validator.getCounts('appointments', result));
    }
  });
}