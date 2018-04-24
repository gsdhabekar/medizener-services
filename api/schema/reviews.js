'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Review schema definitions
var ReviewSchema = new Schema({
  'user_id': {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'User Id is required!']
  },
  'feedback_id': {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'Feedback Id is required!']
  },
  'comment': {
    type: String,
    required: [true, 'Comment is required!']
  },
  'rating': {
    type: Number,
    validate: {
      validator: function (rate) {
        return /^[0-5]*$/.test(rate);
      },
      message: '{VALUE} is not a valid rating!'
    }
  },
  'status': { type: Boolean, default: true },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date }
});

module.exports = mongoose.model('reviews', ReviewSchema);  