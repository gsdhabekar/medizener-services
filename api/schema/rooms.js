'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Room schema definitions
var RoomSchema = new Schema({
  'name': {
    type: String,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z\s]*$/.test(name);
      },
      message: '{VALUE} is not a valid name!'
    },
    required: [true, 'Room name is required!']
  },
  'room_no': {
    type: String,
    validate: {
      validator: function (value) {
        return /^[0-9]*$/.test(value);
      },
      message: '{VALUE} is not a valid value!'
    },
    required: [true, 'Room number is required!']
  },
  // single, double, general, ICU
  'room_type': {
    type: String,
    required: [true, 'Room type is required!']
  },
  // AC, NAC
  'subtype': { type: String },
  'available_status': { type: Boolean, default: true },
  'doctor_id': {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'Doctor id is required!']
  },
  'no_of_bed': {
    type: Number,
    required: [true, 'Number of beds are required!']
  },
  'beds': [{
    'bed_no': { type: Number },
    'status': { type: Boolean, default: true },
    'patient_id': {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    'no_of_days': { type: Number },
    'admitted_date': { type: Number },
    'discharged_date': { type: Number },
    'fees': { type: Number }
  }],
  'fees': {
    type: Number,
    required: [true, 'Room fee is required!']
  },
  'other_facility': { type: String },
  'status': { type: Boolean, default: true },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date }
});

module.exports = mongoose.model('rooms', RoomSchema);