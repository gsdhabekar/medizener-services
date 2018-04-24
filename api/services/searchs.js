'use strict';

var UserModel = require('../schema/users.js');
var Validator = require('../../utils/validator.js');

// Exports all searchs controller 
module.exports = {
  searchs: searchs
};

/**
 * Get all doctors and clinic 
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api GET /api/v1/searchs
 */
function searchs(params, callback) {
  UserModel.find({ 'type': params.type, '$text': { '$search': params.query } })
    .exec(function (err, result) {
      if (err) {
        return callback(Validator.isMongoErr(err));
      } else {
        return callback(null, result);
      }
    });
}