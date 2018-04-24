'use strict';

var ReviewService = require('../services/reviews.js');
var Validator = require('../../utils/validator.js');

// Exports all reviews controllers
module.exports = {
  // Review operations
  getReviews: getReviews,
  addReviews: addReviews,
  deleteReviewById: deleteReviewById,
  getReviewById: getReviewById,
  updateReviewById: updateReviewById
};

/**
 * Add new review of user
 *
 * @param {Schema} Review data
 * @param {Object obj Object to cast}
 * @api POST /api/v1/reviews
 */
function addReviews(req, res) {
  var data = req.body;
  // check for required values of review
  if (Validator.isDefined(data) && Validator.isDefined(data.user_id) && Validator.isDefined(data.feedback_id) && Validator.isDefined(data.comment) && Validator.isDefined(data.rating)) {
    // Add new review of user
    ReviewService.addReviews(data, function (err, result) {
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
 * Get all reviews of user
 *
 * @param {Schema} Review data
 * @param {Object obj Object to cast}
 * @api GET /api/v1/reviews
 */
function getReviews(req, res) {
  var query = req.swagger.params.query.value || '(status=true)';
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
  var user_id = req.swagger.params.user_id.value || undefined;
  // Query and sorts object
  var _queries = Validator.defineObject(query); // query object
  var _sorts = Validator.defineObject(sort);  // sorting object
  // user id
  _queries.user_id = user_id;
  // create fields array
  var _fields = {};
  if (field) {
    var _arr = field.split(',');
    _arr.forEach(function (arr) {
      _fields[arr] = 1;
    });
  }
  // check for review user id
  if (_queries && Validator.isDefined(_queries.user_id)) {
    // params object for db query
    var params = {
      query: _queries,
      fields: _fields,
      limit: limit,
      sort: _sorts,
      skip: skip
    };
    // Get all reviews information
    ReviewService.getReviews(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "user id is required!" }).status(401);
  }
}

/**
 * Get individual review of user
 *
 * @param {Schema} Review Id
 * @param {Object obj Object to cast}
 * @api GET /api/v1/reviews
 */
function getReviewById(req, res) {
  var field = req.swagger.params.field.value || null;
  var review_id = req.swagger.params.review_id.value || undefined;
  // check for menu type
  if (Validator.isDefined(review_id)) {
    // query object
    var _queries = {};
    _queries._id = review_id;
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
    // Get individual reviews information
    ReviewService.getReviewById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Review id is required!" }).status(401);
  }
}

/**
 * Update review of user
 *
 * @param {Schema} Review object
 * @param {Object obj Object to cast}
 * @api PUT /api/v1/reviews
 */
function updateReviewById(req, res) {
  var review_id = req.swagger.params.review_id.value || null;
  var query = req.swagger.params.query.value || '(_id=' + review_id + ')';
  var _queries = Validator.defineObject(query); // query object
  _queries._id = review_id;
  req.body.modified = new Date();
  // check for review id and request body
  if (Validator.isDefined(review_id) && Validator.isDefined(req.body)) {
    var params = {
      query: _queries,
      data: req.body
    };
    // update review 
    ReviewService.updateReviewById(params, function (err, result) {
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
 * Delete review of user
 *
 * @param {Schema} Review id
 * @param {Object obj Object to cast}
 * @api DELETE /api/v1/reviews
 */
function deleteReviewById(req, res) {
  var review_id = req.swagger.params.review_id.value || null;
  // check for review id
  if (Validator.isDefined(review_id)) {
    // query object
    var _queries = {};
    _queries._id = review_id;
    // params object for db query
    var params = {
      query: _queries
    };
    // Delete individual review information
    ReviewService.deleteReviewById(params, function (err, result) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Review id is required!" }).status(401);
  }
}