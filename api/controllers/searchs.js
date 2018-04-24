'use strict';

var SearchService = require('../services/searchs.js');
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
function searchs(req, res) {
  var query = req.swagger.params.search.value;
  // check for search text
  if (Validator.isDefined(query)) {
    var params = {
      type: 'doctor',
      query: query
    };
    // search for doctors and clinic
    SearchService.searchs(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
  }
}