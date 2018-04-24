'use strict';

var RoomModel = require('../schema/rooms.js');
var AppointmentService = require('./appointments.js');
var Validator = require('../../utils/validator.js');
var _PATIENT_KEYS = 'profile first_name last_name specification gender prefix email phone_number dob blood_group';

// Exports all Rooms services
module.exports = {
	getRooms: getRooms,  // Get all Rooms listing
	addRooms: addRooms,   // add new Rooms into database
	getRoomById: getRoomById, // Get individual Rooms info 
	updateRoomById: updateRoomById, // Update Rooms info
	deleteRoomById: deleteRoomById // delete individual Rooms
};

/**
 * Add new Room into medizener
 *
 * @param Room Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/rooms
 */
function addRooms(data, callback) {
	RoomModel.findOne({ 'room_no': data.room_no, 'doctor_id': data.doctor_id, 'is_deleted': false }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('Room is already exists!');
			} else {
				var _record = new RoomModel(data);
				// add default beds with available status
				for (var i = 0; i < _record.no_of_bed; i++) {
					_record.beds.push({
						'bed_no': i + 1,
						'status': true
					});
				}
				// save room record
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						return callback(null, 'Room is successfully added.');
					}
				});
			}
		}
	});
}

/**
 * Get all Room details
 *
 * @param Room Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/rooms
 */
function getRooms(params, callback) {
	RoomModel.find(params.query, params.fields)
		.limit(params.limit)
		.sort(params.sort)
		.skip(params.skip)
		.populate('beds.patient_id', _PATIENT_KEYS)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Get Individual Room details
 *
 * @param Room Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/rooms/{room_id}
 */
function getRoomById(params, callback) {
	RoomModel.findOne(params.query, params.fields)
		.populate('beds.patient_id', _PATIENT_KEYS)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Update Room details 
 *
 * @param Room Schema
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/rooms/{room_id}
 */
function updateRoomById(params, callback) {
	if (params.action) {
		RoomModel.findOne(params.query)
			.exec(function (err, _result) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					if (_result) {
						switch (params.action) {
							case 'add': {
								_result.beds.id(params.set._id).set({
									'bed_no': params.set.bed_no,
									'status': params.set.status,
									'patient_id': params.set.patient_id,
									'admitted_date': new Date().getTime()
								});
								updateBeds(_result);
								break;
							}
							case 'remove': {
								var _bed = _result.beds.id(params.set._id);
								var _days = Validator.getDays(new Date().getTime(), _bed.admitted_date);
								var _update = {
									query: {
										_id: params.set.appointment_id
									},
									$set: {
										bed_history: {
											'bed_no': _bed.bed_no,
											'status': _bed.status,
											'patient_id': _bed.patient_id,
											'admitted_date': _bed.admitted_date,
											'discharged_date': new Date().getTime(),
											'no_of_days': _days,
											'fees': (_days * _result.fees)
										}
									}
								};
								// update appointments
								AppointmentService.updateAppointmentById(_update, function (err, data) {
									if (err) {
										return callback(err);
									} else {
										_result.beds.id(params.set._id).set({
											'bed_no': params.set.bed_no,
											'status': true,
											'patient_id': undefined
										});
										updateBeds(_result);
									}
								});
								break;
							}
							case 'upsert_beds': {
								for (var i = 0; i < params.set.no_of_bed; i++) {
									var exists = _result.beds.filter(function (x) {
										return x.bed_no === (i + 1);
									})[0];
									// check for existing beds
									if (!Validator.isValidObject(exists)) {
										_result.beds.push({
											'bed_no': i + 1,
											'status': true
										});
									}
								}
								updateBeds(_result);
								break;
							}
						}
						// update beds information
						function updateBeds(_beds) {
							_beds.save(function (err) {
								if (err) {
									return callback(Validator.isMongoErr(err));
								} else {
									return callback(null, 'Room is updated successfully.');
								}
							});
						}
					} else {
						return callback('Room is not found.');
					}
				}
			});
	} else {
		// update room schema
		RoomModel.update(params.query, params.set)
			.exec(function (err) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					return callback(null, 'Room is updated successfully.');
				}
			});
	}
}

/**
 * Delete rooms details 
 *
 * @param Room Schema
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/rooms/{room_id}
 */
function deleteRoomById(_id, callback) {
	RoomModel.update({ '_id': _id }, { $set: { 'is_deleted': true } })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Room is deleted successfully.');
			}
		});
}