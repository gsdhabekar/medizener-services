(function () {
  'use strict';

  var jwt = require('jsonwebtoken');
  var UserModel = require('../api/schema/users.js');
  var _CONST = require('../config/resources.js');
  var agenda = require('./agenda.js');

  // validator functions
  module.exports = {
    isDefined: isDefined,
    defineObject: defineObject,
    isValidObject: isValidObject,
    isJSON: isJSON,
    isEmail: isEmail,
    isPhoneNumber: isPhoneNumber,
    calculateAge: calculateAge,
    isZipCode: isZipCode,
    isValidName: isValidName,
    isMongoErr: isMongoErr,
    isValidUser: isValidUser,
    isUpload: isUpload,
    getDays: getDays,
    random: random,
    isArray: isArray,
    getCounts: getCounts,
    schedule: schedule
  };


  /* @function : isDefined
   * @param    : data {string}
   * @created  : 06032016
   * @modified : 06032016
   * @purpose  : To validate provided data
   * @return   : true or false
   * @public   
   */
  function isDefined(key) {
    return typeof key !== 'undefined';
  }


  /* @function : defineObject
   * @param    : data {string}
   * @created  : 06032016
   * @modified : 06032016
   * @purpose  : To generate query object
   * @return   : true or false
   * @public   : ($or=type?regular^type?follow_up,date=$lte?100~$gte?10,type=$in?regular&patient_friendly&follow_up,name=demo)
   */
  function defineObject(query) {
    // Query reader between brackets
    var init = query.indexOf('(');
    var fin = query.indexOf(')');
    var queries = query.substr(init + 1, fin - init - 1);
    queries = queries.split(",");

    // create query string
    var _tempArr = {};
    queries.forEach(function (query) {
      var _key = query.split('=');
      _tempArr[_key[0]] = generateQueryStr(_key[0], _key[1]);
    });
    return _tempArr;
  }

  // Generate operators query string
  function generateQueryStr(key, value) {
    // query string for $or & $and
    var _value = (value && value.indexOf('^') !== -1) ? value.split('^') : value;
    if (Array.isArray(_value)) {
      var _arr = _value.map(function (i) {
        var _temp = i.split('?');
        return createJSONProperty(_temp);
      });
      return _arr;
    } else {
      // query string for $lte, $lt, $gte, $gt
      var _value = (value && value.indexOf('~') !== -1) ? value.split('~') : value;
      if (Array.isArray(_value)) {
        var _json = {};
        _value.forEach(function (i, index) {
          var _temp = i.split('?');
          _json[_temp[0]] = _temp[1];
        });
        return _json;
      } else {
        // query string for $in
        var _value = (value && value.indexOf('?') !== -1) ? value.split('?') : value;
        if (Array.isArray(_value)) {
          var _json = {};
          var _arr = _value[1].split('&');
          _json[_value[0]] = _arr;
          return _json;
        } else {
          return value;
        }
      }
    }
  }

  // create key from input string
  function createJSONProperty(_arr) {
    var _json = {};
    _json[_arr[0]] = _arr[1];
    return _json;
  }

  /* @function : isValidObject
   * @param    : _Object {object}
   * @created  : 24022016
   * @modified : 06022016
   * @purpose  : To validate provided data
   * @return   : 401 or 401 or 200
   * @public   
   */
  function isValidObject(_Object) {
    if (isJSON(_Object)) {
      for (var obj in _Object) {
        if (isJSON(_Object[obj])) {
          for (var _arr in _Object[obj]) {
            if (_Object[obj][_arr] === null || _Object[obj][_arr] === '')
              delete _Object[obj][_arr];
          }
          if (!isJSON(_Object[obj]))
            delete _Object[obj];
        } else {
          if (_Object[obj] === null || _Object[obj] === '')
            delete _Object[obj];
          if (Array.isArray(_Object[obj]) && _Object[obj].length == 0)
            delete _Object[obj];
        }
      }
    }
    return _Object;
  }

  function isJSON(_obj) {
    var _has_keys = 0;
    _obj = JSON.parse(JSON.stringify(_obj)); // issue with hasOwnProperty... so parsed json
    for (var _pr in _obj) {
      if (_obj.hasOwnProperty(_pr) && !(/^\d+$/.test(_pr))) {
        _has_keys = 1;
        break;
      }
    }
    return (_has_keys && _obj.constructor == Object && _obj.constructor != Array) ? 1 : 0;
  }

  /* @function : isEmail
   * @param    : Email
   * @created  : 22032016
   * @modified : 22032016
   * @purpose  : To validate email and return status
   * @return   : Status : true, false
   * @public   
   */
  function isEmail(email) {
    return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(email);
  }

  /* @function : isPhoneNumber
  * @param    : Phone Number
  * @created  : 22032016
  * @modified : 22032016
  * @purpose  : To validate phone number and return status
  * @return   : Status : true, false
  * @public   
  */
  function isPhoneNumber(phone) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
  }

  /* @function : calculateAge
   * @param    : Two dates
   * @created  : 22032016
   * @modified : 22032016
   * @purpose  : To validate dob and anniversary date
   * @return   : age number
   * @public   
   */
  function calculateAge(current, date) {
    var ageDifMs = current.getTime() - date.getTime();
    var ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  /* @function : isZipCode
   * @param    : zipcode
   * @created  : 22032016
   * @modified : 22032016
   * @purpose  : To validate zipcode
   * @return   : true, false
   * @public   
   */
  function isZipCode(zipcode) {
    return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode);
  }

  /* @function : isValidName
   * @param    : Name
   * @created  : 22032016
   * @modified : 22032016
   * @purpose  : To validate name
   * @return   : true, false
   * @public   
   */
  function isValidName(name) {
    return /^[a-zA-Z\s]*$/.test(name);
  }

  /* @function : isMongoErr
   * @param    : Name
   * @created  : 06042016
   * @modified : 06042016
   * @purpose  : To return mongodb error message
   * @return   : message
   * @public   
   */
  function isMongoErr(_Obj) {
    if (_Obj && _Obj.errors) {
      var key = Object.keys(_Obj.errors)[0];
      return _Obj.errors[key].message;
    } else {
      return _Obj.message;
    }
  }

  /* @function : isValidUser
   * @param    : Token
   * @created  : 11042016
   * @modified : 11042016
   * @purpose  : To return token verification data
   * @return   : message
   * @public   
   */
  function isValidUser(req, callback) {
    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      var _id = req.swagger.params.user_id.value;
      var access_id = req.swagger.params.access_id.value;
      var access_type = req.swagger.params.access_type.value;
      // find user token for status checking
      UserModel.findOne({ token: parts[1] })
        .exec(function (err, user) {
          if (err) {
            return callback(err.message);
          } else {
            if (user && user._id.equals(_id)) {
              jwt.verify(user.token, _CONST.privateKey, function (err, verifyUser) {
                if (err) {
                  return callback(err.message);
                } else {
                  // Access by admin or doctor
                  if (isDefined(access_id) && isDefined(access_type)) {
                    switch (user.type) {
                      case 'admin': {
                        verifyUser.id = access_id;
                        return callback(null, verifyUser);
                        break;
                      }
                      case 'doctor': {
                        UserModel.findOne({ _id: access_id })
                          .exec(function (err, access_user) {
                            if (err) {
                              return callback(err.message);
                            } else {
                              if (access_user && access_user.type === access_type) {
                                verifyUser.id = access_id;
                                return callback(null, verifyUser);
                              } else {
                                return callback("User is not authorized!");
                              }
                            }
                          });
                        break;
                      }
                      default: {
                        return callback("User is not authorized!");
                      }
                    }
                  } else {
                    return callback(null, verifyUser);
                  }
                }
              });
            } else {
              return callback("User is not authorized!");
            }
          }
        });
    } else {
      return callback(true, null);
    }
  }

  /* @function : isUpload
   * @param    : Token
   * @created  : 06092016
   * @modified : 06092016
   * @purpose  : Check for valid file upload type
   * @return   : message
   * @public   
   */
  function isUpload(type) {
    return type === "profile" || type === "degree_certificate" || type === "extra_certificate" || type === "medical_reg_certificate" || type === "business_card";
  }

  /* @function : getDays
   * @param    : timestamp
   * @created  : 22122016
   * @modified : 22122016
   * @purpose  : Return number of days between two dates
   * @return   : number of days
   * @public   
   */
  function getDays(current, past) {
    return Math.abs((current - past) / (24 * 60 * 60 * 1000));
  }

  /* @function : random
   * @param    : generate random tsring
   * @created  : 27012017
   * @modified : 27012017
   * @purpose  : Return random string for password
   * @return   : string
   * @public   
   */
  function random() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // random text
    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  /* @function : isArray
   * @param    : check value is array or not
   * @created  : 25022017
   * @modified : 25022017
   * @purpose  : Return boolean value
   * @return   : boolean
   * @public   
   */
  function isArray(_arr) {
    return Array.isArray(_arr);
  }

  /* @function : getCounts
   * @param    : Get counts of users and appointments
   * @created  : 22032017
   * @modified : 22032017
   * @purpose  : Return counts   
   */
  function getCounts(_type, _data) {
    var _count = {};
    switch (_type) {
      case 'users': {
        _data.forEach(function (result) {
          if (result._id === 'patient') {
            _count.patients = result.count || 0;
          } else if (result._id === 'staff') {
            _count.staffs = result.count || 0;
          }
        });
        break;
      }
      case 'appointments': {
        _count.regular_appointments = 0;
        _data.forEach(function (result) {
          if (result._id === 'online') {
            _count.online_appointments = result.count || 0;
          } else {
            _count.regular_appointments = (_count.regular_appointments + result.count) || 0;
          }
        });
        break;
      }
    }
    return _count;
  }
  /* @function : schedule
   * @param    : Get counts of users and appointments
   * @created  : 19092017
   * @modified : 19092017
   * @purpose  : Schedule agenda cron job   
   */
  function schedule(params) {
    switch (params.type) {
      case 'appointment': {
        agenda.schedule(new Date(params.timestamp), "sendNotification", params.data);
        break;
      }
      // disable doctor availability
      case 'holiday_start': {
        agenda.schedule(new Date(params.timestamp), "updateHoliday", params.data);
        break;
      }
      // enable doctor availability
      case 'holiday_stop': {
        agenda.schedule(new Date(params.timestamp), "updateHoliday", params.data);
        break;
      }
      default: {
        console.log("Please provide valid scheduler type.");
      }
    }
  }
})();