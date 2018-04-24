'use strict';

var moment = require('moment');
var AppointmentService = require('../services/appointments.js');
var UserService = require('../services/users.js');
var Validator = require('../../utils/validator.js');

// Exports all appointments controller 
module.exports = {
  // All appointment information
  getAppointments: getAppointments,
  addAppointments: addAppointments,
  // Individual Appointment controller
  getAppointmentById: getAppointmentById,
  updateAppointmentById: updateAppointmentById,
  deleteAppointmentById: deleteAppointmentById
};

/**
 * Add new appoinment into medizener
 *
 * @param Appointment Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/appointments
 */
function addAppointments(req, res) {
  // Validate appoinment request
  if (Validator.isValidObject(req.body) && !moment(req.body.appointment_date).isSameOrBefore(new Date())) {
    AppointmentService.addAppointments(req.body, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Please enter valid appointment date." }).status(401);
  }
}

/**
 * Get all appointment details
 *
 * @param Appointment Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/appointments
 */
function getAppointments(req, res) {
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

  // start and end date of appointment
  if (Validator.isDefined(_queries.start_date) && Validator.isDefined(_queries.end_date)) {
    var startDate = moment(_queries.start_date);
    var endDate = moment(_queries.end_date);
    _queries.appointment_date = {
      '$gte': startDate.unix(),
      '$lt': endDate.unix()
    }
    delete _queries.start_date;
    delete _queries.end_date;
  }

  // params object for db query
  var params = {
    query: _queries,
    fields: _fields,
    limit: limit,
    sort: _sorts,
    skip: skip
  };

  // Get all appointments information
  AppointmentService.getAppointments(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
    }
  });
}

/**
 * Get Individual appointment details
 *
 * @param Appointment Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/appointments/{appointment_id}
 */
function getAppointmentById(req, res) {
  var field = req.swagger.params.field.value || null;
  var appointment_id = req.swagger.params.appointment_id.value || undefined;
  // check for appointment id
  if (Validator.isDefined(appointment_id)) {
    // query object
    var _queries = {};
    _queries._id = appointment_id;
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
    // Get individual appointment information
    AppointmentService.getAppointmentById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Appointment id is required!" }).status(401);
  }
}

/**
 * Update appointment details 
 *
 * @param Appointment Schema
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/appointments/{appointment_id}
 */
function updateAppointmentById(req, res) {
  var _id = req.swagger.params.appointment_id.value;
  var query = req.swagger.params.query.value || '()';
  var action = req.swagger.params.action.value || 'all';
  // query object
  var _data = req.body;
  var _queries = Validator.defineObject(query);
  _queries._id = _id;
  // check for valid object and appointment date
  if (Validator.isValidObject(_data)) {
    _data.modified = new Date();
    // (Validator.isDefined(_data.patient_id)) ? delete _data.patient_id : _data.patient_id;
    (Validator.isDefined(_data.doctor_id)) ? delete _data.doctor_id : _data.doctor_id;
    // check whether Appointment date is valid or not
    if (Validator.isDefined(_data.appointment_date)) {
      var newDate = moment(_data.appointment_date);
      var currentStamp = newDate.unix();
      if (newDate.isSameOrBefore(new Date())) {
        res.jsonp({ "code": 401, "message": "Please enter valid appointment date." }).status(401);
      } else {
        _data.appointment_date = currentStamp;
        isWebUpdate();
      }
    } else {
      isWebUpdate();
    }
    // check update from web or mobile
    function isWebUpdate() {
      if (_data.isWebEdit && Validator.isJSON(_data.patient_id)) {
        var patientParams = {
          query: { _id: _data.patient_id._id },
          set: { $set: _data.patient_id }
        };
        UserService.updateUserById(patientParams, function (err, result) {
          if (err) {
            res.jsonp({ "code": 401, "message": err }).status(401);
          } else {
            queryObject();
          }
        });
      } else {
        queryObject();
      }
    }
    // params object
    function queryObject() {
      var params = {};
      params.query = _queries;
      switch (action) {
        case 'pending': {
          _data.appointment_status = {
            status: 'pending',
            date: new Date()
          };
          break;
        }
        case 'completed': {
          _data.appointment_status = {
            status: 'completed',
            date: new Date()
          };
          break;
        }
        case 'cancelled': {
          _data.appointment_status = {
            status: 'cancelled',
            date: new Date()
          };
          break;
        }
      }
      params.set = { $set: _data };
      updateAppointment(req, res, params);
    }
  } else {
    res.jsonp({ "code": 401, "message": "Request object is not valid." }).status(401);
  }
}

// Update appointment function
function updateAppointment(req, res, params) {
  AppointmentService.updateAppointmentById(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": result }).status(200);
    }
  });
}

/**
 * Delete appointments details 
 *
 * @param Appointment Schema
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/appointments/{appointment_id}
 */
function deleteAppointmentById(req, res) {
  var _id = req.swagger.params.appointment_id.value;
  // Delete individual appointment information
  AppointmentService.deleteAppointmentById(_id, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": result }).status(200);
    }
  });
}