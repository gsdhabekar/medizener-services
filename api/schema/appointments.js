'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Appointment schema definitions
var AppointmentSchema = new Schema({
  // regular, patient_friendly, follow_up
  'type': {
    type: String,
    required: [true, 'Appointment type is required!']
  },
  'patient_id': {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'Patient Id is required!']
  },
  'doctor_id': {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'Doctor Id is required!']
  },
  'room_id': {
    type: Schema.Types.ObjectId,
    ref: 'rooms'
  },
  'bed_history': { type: Object },
  'fees': {
    type: String,
    validate: {
      validator: function (value) {
        return /^[0-9]*$/.test(value);
      },
      message: '{VALUE} is not a valid value!'
    }
  },
  'referred_id': {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  'interval_time': {
    type: Number,
    required: [true, 'Interval time is required!']
  },
  'priscriptions': { type: String },
  'symptones': { type: String },
  'medication': [{
    'name': { type: String },
    'daily': { type: String },
    'doses': { type: String },
    'meals': { type: String },
    'type': { type: String }
  }],
  'follow_up_after': { type: Number },
  'signature': { type: String },
  // timestamp date convert into standard time (timestamp*1000)
  'appointment_date': {
    type: Number,
    required: [true, 'Appointment date is required!']
  },
  // scheduled, pending, completed, cancelled
  'appointment_status': {
    status: { type: String },
    date: { type: Date }
  },
  // Morning, Afternoon, Evening, Night
  'appointment_day': { type: String },
  'booked_status': { type: Boolean, default: false },
  'status': { type: Boolean, default: true },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date }
});

module.exports = mongoose.model('appointments', AppointmentSchema);