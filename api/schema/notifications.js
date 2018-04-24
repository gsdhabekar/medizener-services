'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Notification schema definitions
var NotificationSchema = new Schema({
  'registrationToken': { type: String },
  'title': { type: String, required: [true, 'Title is required!'] },
  'message': { type: String, required: [true, 'Message is required!'] },
  'sender_id': { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'Sender Id is required!'] },
  'receiver_id': { type: Schema.Types.ObjectId, ref: 'users' },
  'is_read': { type: Boolean, default: false },
  'status': { type: Boolean, default: true },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date }
});

module.exports = mongoose.model('notifications', NotificationSchema);