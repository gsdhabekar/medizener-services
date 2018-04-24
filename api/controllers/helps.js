'use strict';

var HelpService = require('../services/helps.js');
var Validator = require('../../utils/validator.js');

// Exports all helps controllers
module.exports = {
  // Help operations
  getHelps: getHelps,
  addHelps: addHelps,
  deleteHelpById: deleteHelpById,
  getHelpById: getHelpById,
  updateHelpById: updateHelpById
};

/**
 * Add new help of medizener
 *
 * @param {Schema} help data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/helps
 */
function addHelps(req, res) {
  var data = req.body;
  // check for required values of help
  if (Validator.isDefined(data) && Validator.isDefined(data.title) && Validator.isDefined(data.content)) {
    // Add new help of medizener
    HelpService.addHelps(data, function (err, result) {
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
 * Get all helps of medizener
 *
 * @param {Schema} Help data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/helps
 */
function getHelps(req, res) {
  var query = req.swagger.params.query.value || '(status=true)';
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
  // Query and sorts object
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
  // Get all helps information
  HelpService.getHelps(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
    }
  });
}

/**
 * Get individual help of medizener
 *
 * @param {Schema} help Id
 * @param {Object obj Object to cast}
 * @api GET /api/v1/helps
 */
function getHelpById(req, res) {
  var field = req.swagger.params.field.value || null;
  var help_id = req.swagger.params.help_id.value || undefined;
  // check for menu type
  if (Validator.isDefined(help_id)) {
    // query object
    var _queries = {};
    _queries._id = help_id;
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
    // Get indivial helps information
    HelpService.getHelpById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Help id is required!" }).status(401);
  }
}

/**
 * Update help of medizener
 *
 * @param {Schema} help object
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/helps
 */
function updateHelpById(req, res) {
  var help_id = req.swagger.params.help_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + help_id + ')';
  var _queries = Validator.defineObject(query); // query object
  _queries._id = help_id;
  req.body.modified = new Date();
  // check for help id and request body
  if (Validator.isDefined(help_id) && Validator.isDefined(req.body)) {
    var params = {
      query: _queries,
      data: req.body
    };
    // update help 
    HelpService.updateHelpById(params, function (err, result) {
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
 * Delete help of medizener
 *
 * @param {Schema} help id
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/helps
 */
function deleteHelpById(req, res) {
  var help_id = req.swagger.params.help_id.value || null;
  // check for help id
  if (Validator.isDefined(help_id)) {
    // query object
    var _queries = {};
    _queries._id = help_id;
    // params object for db query
    var params = {
      query: _queries
    };
    // Delete individual help information
    HelpService.deleteHelpById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Help id is required!" }).status(401);
  }
}