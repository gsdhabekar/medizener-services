'use strict';

var moment = require('moment');
var AppointmentModel = require('../schema/appointments.js');
var Validator = require('../../utils/validator.js');
var UserSerice = require('./users.js');
var schedule = require('../../json/schedule.json');
var _DOCTOR_KEYS = 'profile first_name last_name specification gender prefix email phone_number dob blood_group address rating fees hospital_name experience';
var _PATIENT_KEYS = 'profile first_name last_name gender prefix email phone_number dob blood_group address rating';

// Exports all appointments services
module.exports = {
  getAppointments: getAppointments,  // Get all Appointments listing
  addAppointments: addAppointments,   // add new Appointments into database
  getAppointmentById: getAppointmentById, // Get individual Appointments info 
  updateAppointmentById: updateAppointmentById, // Update Appointments info
  deleteAppointmentById: deleteAppointmentById // delete individual Appointments
};

/**
 * Add new appoinment into medizener
 *
 * @param Appointment Schema
 * @param {Object} obj Object to cast}
 * @api POST /api/v1/appointments
 */
function addAppointments(data, callback) {
  var newDate = moment(data.appointment_date);
  var currentStamp = newDate.unix();
  var addedStamp = newDate.add(data.interval_time, 'm').unix();
  // check existing appointment  
  AppointmentModel.findOne({
    'appointment_date': {
      '$gte': currentStamp,
      '$lt': (addedStamp - (1000 * 60))
    }
  }, function (err, result) {
    if (err) {
      return callback(Validator.isMongoErr(err));
    } else {
      if (result) {
        return callback('Appointment is already scheduled. Please try to add new appointment.');
      } else {
        // schedule appointment notification
        if (data.registrationToken) {
          var scheduler = schedule.data;
          scheduler.forEach(function (t) {
            Validator.schedule({
              type: 'appointment',
              data: {
                registrationToken: data.registrationToken,
                title: t.title,
                message: t.message,
                source: t.source
              },
              timestamp: (moment(newDate).subtract(t.time, 'm').unix() * 1000)
            });
          });
        }
        // adding appointment from web application
        if (Validator.isJSON(data.patient_id)) {
          data.patient_id.password = Validator.random();
          data.patient_id.status = true;
          UserSerice.addUsers(data.patient_id, function (err, result, id) {
            if (err) {
              return callback(err);
            } else {
              data.patient_id = id;
              saveData();
            }
          });
        } else {
          saveData();
        }
        // save appointment data 
        function saveData() {
          var _record = new AppointmentModel(data);
          _record.appointment_date = currentStamp;
          _record.appointment_status = {
            'status': 'scheduled',
            'date': new Date()
          };
          // save new appointment
          _record.save(function (err) {
            if (err) {
              return callback(Validator.isMongoErr(err));
            } else {
              return callback(null, 'Appointment is successfully added.');
            }
          });
        }
      }
    }
  });
}

/**
 * Get all appointment details
 *
 * @param Appointment Schema
 * @param {Object} obj Object to cast}
 * @api GET /api/v1/appointments
 */
function getAppointments(params, callback) {
  AppointmentModel.find(params.query, params.fields)
    .limit(params.limit)
    .sort(params.sort)
    .skip(params.skip)
    .populate('doctor_id', _DOCTOR_KEYS)
    .populate('patient_id', _PATIENT_KEYS)
    .populate('room_id')
    .exec(function (err, result) {
      if (err) {
        return callback(Validator.isMongoErr(err));
      } else {
        return callback(null, result);
      }
    });
}

/**
 * Get Individual appointment details
 *
 * @param Appointment Schema
 * @param {Object} obj Object to cast}
 * @api POST /api/v1/appointments/{appointment_id}
 */
function getAppointmentById(params, callback) {
  AppointmentModel.findOne(params.query, params.fields)
    .populate('doctor_id', _DOCTOR_KEYS)
    .populate('patient_id', _PATIENT_KEYS)
    .populate('room_id')
    .exec(function (err, result) {
      if (err) {
        return callback(Validator.isMongoErr(err));
      } else {
        return callback(null, result);
      }
    });
}

/**
 * Update appointment details 
 *
 * @param Appointment Schema
 * @param {Object} obj Object to cast}
 * @api PUT /api/v1/appointments/{appointment_id}
 */
function updateAppointmentById(params, callback) {
  AppointmentModel.update(params.query, params.set)
    .exec(function (err) {
      if (err) {
        return callback(Validator.isMongoErr(err));
      } else {
        return callback(null, 'Appointment is updated successfully.');
      }
    });
}

/**
 * Delete appointments details 
 *
 * @param Appointment Schema
 * @param {Object} obj Object to cast}
 * @api DELETE /api/v1/appointments/{appointment_id}
 */
function deleteAppointmentById(_id, callback) {
  AppointmentModel.update({ '_id': _id }, { $set: { 'is_deleted': true } })
    .exec(function (err) {
      if (err) {
        return callback(Validator.isMongoErr(err));
      } else {
        return callback(null, 'Appointment is deleted successfully.');
      }
    });
}