'use strict';

var async = require('async');
var ComponentService = require('../services/components.js');
var Validator = require('../../utils/validator.js');

// Exports all components controller 
module.exports = {
  // All components information
  getComponents: getComponents,
  addComponents: addComponents,
  // Individual components controller
  getComponentById: getComponentById,
  updateComponentById: updateComponentById,
  deleteComponentById: deleteComponentById
};

/**
 * Add new component into medizener
 *
 * @param Component Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/components
 */
function addComponents(req, res) {
  // Validate component request
  if (Validator.isValidObject(req.body)) {
    if (Validator.isArray(req.body)) {
      async.each(req.body, function (item, callback) {
        ComponentService.addComponents(item, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, result);
          }
        });
      }, function (err) {
        if (err) {
          res.jsonp({ "code": 401, "message": err }).status(401);
        } else {
          res.jsonp({ "code": 200, "message": "All records are saved successfully." }).status(200);
        }
      });
    } else {
      ComponentService.addComponents(req.body, function (err, result) {
        if (err) {
          res.jsonp({ "code": 401, "message": err }).status(401);
        } else {
          res.jsonp({ "code": 200, "message": result }).status(200);
        }
      });
    }
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
  }
}

/**
 * get all components list
 *
 * @param Component Schema
 * @api GET /api/v1/components
 */
function getComponents(req, res) {
  var query = req.swagger.params.query.value || '()';
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
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

  // Get all components information
  ComponentService.getComponents(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
    }
  });
}

/**
 * Get individual component details
 *
 * @param Component Schema
 * @api GET /api/v1/components/{component_id}
 */
function getComponentById(req, res) {
  var field = req.swagger.params.field.value || null;
  var component_id = req.swagger.params.component_id.value || undefined;
  // check for component id
  if (Validator.isDefined(component_id)) {
    // query object
    var _queries = {};
    _queries._id = component_id;
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
    // Get individual component information
    ComponentService.getComponentById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Component id is required!" }).status(401);
  }
}

/**
 * Update individual component details
 *
 * @param Component Schema
 * @api PUT /api/v1/components
 */
function updateComponentById(req, res) {
  var component_id = req.swagger.params.component_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + component_id + ')';
  var _queries = Validator.defineObject(query); // query object
  _queries._id = component_id;
  req.body.modified = new Date();
  // check for component_id and request body
  if (Validator.isDefined(component_id) && Validator.isDefined(req.body)) {
    var params = {
      query: _queries,
      data: req.body
    };
    // update component 
    ComponentService.updateComponentById(params, function (err, result) {
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
 * Delete individual component details
 *
 * @param Component Schema
 * @api DELETE /api/v1/components
 */
function deleteComponentById(req, res) {
  var component_id = req.swagger.params.component_id.value || null;
  // check for component id
  if (Validator.isDefined(component_id)) {
    // query object
    var _queries = {};
    _queries._id = component_id;
    // params object for db query
    var params = {
      query: _queries
    };
    // Delete individual component information
    ComponentService.deleteComponentById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Component id is required!" }).status(401);
  }
}