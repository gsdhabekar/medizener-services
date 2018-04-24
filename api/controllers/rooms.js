'use strict';

var RoomService = require('../services/rooms.js');
var Validator = require('../../utils/validator.js');

// Exports all Rooms controller 
module.exports = {
  // All Room information
  getRooms: getRooms,
  addRooms: addRooms,
  // Individual Room controller
  getRoomById: getRoomById,
  updateRoomById: updateRoomById,
  deleteRoomById: deleteRoomById
};

/**
 * Add new room into medizener
 *
 * @param room Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/rooms
 */
function addRooms(req, res) {
  // Validate room request
  if (Validator.isValidObject(req.body) && Validator.isDefined(req.body.doctor_id) && Validator.isDefined(req.body.no_of_bed)) {
    RoomService.addRooms(req.body, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." });
  }
}

/**
 * Get all room details
 *
 * @param room Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/rooms
 */
function getRooms(req, res) {
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
    skip: skip
  };

  // Get all rooms information
  RoomService.getRooms(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
    }
  });
}

/**
 * Get Individual room details
 *
 * @param room Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/rooms/{room_id}
 */
function getRoomById(req, res) {
  var field = req.swagger.params.field.value || null;
  var room_id = req.swagger.params.room_id.value || undefined;
  // check for room id
  if (Validator.isDefined(room_id)) {
    // query object
    var _queries = {};
    _queries._id = room_id;
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
    // Get individual room information
    RoomService.getRoomById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Room id is required!" }).status(401);
  }
}

/**
 * Update room details 
 *
 * @param room Schema
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/rooms/{room_id}
 */
function updateRoomById(req, res) {
  var room_id = req.swagger.params.room_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + room_id + ')';
  var action = req.swagger.params.action.value;
  var set = req.swagger.params.set.value || '()';
  var _queries = Validator.defineObject(query); // query object
  var _set = Validator.defineObject(set); // set object
  _queries._id = room_id;
  req.body.modified = new Date();
  // check for room_id and request body
  if (Validator.isDefined(room_id) && Validator.isDefined(req.body)) {
    // params object
    var params = {
      query: _queries
    };
    // update values according to action
    switch (action) {
      case 'add': {
        if (Validator.isDefined(_set._id) && Validator.isDefined(_set.patient_id)) {
          params.action = action;
          params.set = _set;
        } else {
          res.jsonp({ "code": 401, "message": "Bed Id/Patient Id is missing!" }).status(401);
        }
        break;
      }
      case 'remove': {
        if (Validator.isDefined(_set._id) && Validator.isDefined(_set.appointment_id)) {
          params.action = action;
          params.set = _set;
        } else {
          res.jsonp({ "code": 401, "message": "Bed Id/Appointment Id is missing!" }).status(401);
        }
        break;
      }
      case 'upsert_beds': {
        params.action = action;
        params.set = _set;
        break;
      }
      default: {
        params.set = { $set: req.body };
      }
    }
    // update room 
    RoomService.updateRoomById(params, function (err, result) {
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
 * Delete rooms details 
 *
 * @param room Schema
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/rooms/{room_id}
 */
function deleteRoomById(req, res) {
  var _id = req.swagger.params.room_id.value;
  // Delete individual room information
  RoomService.deleteRoomById(_id, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": result }).status(200);
    }
  });
}