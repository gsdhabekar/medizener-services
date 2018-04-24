'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

// Users schema definitions
var UserSchema = new Schema({
  // basic profile info
  'prefix': { type: String },
  'first_name': {
    type: String,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z]*$/.test(name);
      },
      message: '{VALUE} is not a valid name!'
    },
    required: [true, 'First name is required!']
  },
  'last_name': {
    type: String,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z]*$/.test(name);
      },
      message: '{VALUE} is not a valid name!'
    },
    required: [true, 'Last name is required!']
  },
  'profile': { type: String },
  'username': {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z0-9]*$/.test(name);
      },
      message: '{VALUE} is not a valid username!'
    },
    required: [true, 'Username is required!']
  },
  'user_id': {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  'email': {
    type: String,
    lowercase: true,
    validate: {
      validator: function (email) {
        var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
      },
      message: '{VALUE} is not a valid email!'
    },
    required: [true, 'Email is required!']
  },
  'secondary_email': {
    type: String,
    lowercase: true,
    validate: {
      validator: function (email) {
        var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
      },
      message: '{VALUE} is not a valid email!'
    }
  },
  'password': { type: String, required: true },
  'phone_number': {
    type: String,
    validate: {
      validator: function (value) {
        return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value);
      },
      message: '{VALUE} is not a valid number!'
    },
    required: [true, 'Phone number is required!']
  },
  'dob': { type: Date },
  'blood_group': { type: String },
  'weight': {
    type: String,
    validate: {
      validator: function (value) {
        return /^[0-9]*$/.test(value);
      },
      message: '{VALUE} is not a valid weight!'
    }
  },
  'height': {
    type: String,
    validate: {
      validator: function (value) {
        return /^[0-9]*$/.test(value);
      },
      message: '{VALUE} is not a valid height!'
    }
  },
  'social': [{
    'access_token': { type: String },
    'refresh_token': { type: String },
    'name': { type: String }
  }],
  'address': [{
    'address_type': {
      type: String,
      required: [true, 'Address type is required!']
    },
    'address1': { type: String },
    'address2': { type: String },
    'city': {
      type: String,
      validate: {
        validator: function (city) {
          return /^[a-zA-Z\s]*$/.test(city);
        },
        message: '{VALUE} is not a valid city!'
      },
      required: [true, 'City name is required!']
    },
    'status': { type: Boolean, default: true },
    'state': { type: String },
    'postal_code': {
      type: String,
      validate: {
        validator: function (value) {
          return /^[1-9][0-9]{5}$/.test(value);
        },
        message: '{VALUE} is not a valid postal code!'
      }
    }
  }],
  'gender': {
    type: String,
    validate: {
      validator: function (gender) {
        return gender === 'male' || gender === 'female';
      },
      message: '{VALUE} is not a valid gender!'
    }
  },
  // default values
  'type': {
    type: String,
    validate: {
      validator: function (type) {
        return type === 'doctor' || type === 'patient' || type === 'staff' || type === 'admin';
      },
      message: '{VALUE} is not a valid user type!'
    },
    required: [true, 'User type is required!']
  },
  'status': { type: Boolean, default: false },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date },
  'token': { type: String },
  'deviceId': { type: String },
  'rating': {
    type: String,
    validate: {
      validator: function (value) {
        return /^[0-5]*$/.test(value);
      },
      message: '{VALUE} is not a valid rating!'
    },
    default: '0'
  },
  // doctor values
  'mrn_number': {
    type: String,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9]*$/.test(value);
      },
      message: '{VALUE} is not a valid value!'
    }
  },
  'hospital_name': { type: String },
  'degree_certificate': { type: String },
  'extra_certificate': { type: String },
  'medical_reg_certificate': { type: String },
  'business_card': { type: String },
  'specification': { type: String },
  'grade': { type: String },
  'experience': { type: Number },
  'interval_time': { type: Number },
  'home_facility': { type: Boolean },
  'verified': { type: Boolean, default: false }, // verified by admin
  'acceptTerms': { type: Boolean },
  'staff_position': { type: String },
  'slot': { type: Number },
  'availability': { type: Boolean, default: true },
  'holiday': {
    'start': { type: Date },
    'stop': { type: Date }
  },
  // Morning, Afternoon, Evening, MRA, Weekends 
  'available_time': [{
    'start_time': { type: Date },
    'end_time': { type: Date },
    'type': { type: String },
    'status': { type: Boolean },
    'address_type': { type: String }
  }],
  // Regular, Consultant, Online, Home Facility
  'fees': [{
    'price': {
      type: String,
      validate: {
        validator: function (value) {
          return /^[0-9]*$/.test(value);
        },
        message: '{VALUE} is not a valid value!'
      }
    },
    'type': { type: String }
  }]
});

// search indexes list
UserSchema.index({
  'first_name': 'text',
  'last_name': 'text',
  'hospital_name': 'text',
  'specification': 'text'
});

// Generate bcrypt password
UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Campare bcrypt password
UserSchema.methods.campareHash = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Fullname virtuals
UserSchema.virtual('fullname').get(function () {
  return this.first_name + ' ' + this.last_name;
});

module.exports = mongoose.model('users', UserSchema);  