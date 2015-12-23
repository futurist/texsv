'use strict';
var mongoose   = require('mongoose')
  , _ObjectId   = mongoose.Schema.Types.ObjectId;
var common = require('../common')

var schema = mongoose.Schema(
	{
	  name: String,
	  email: {type: String, lowercase: true},
	  parent: {ref:'person', type: _ObjectId}
	}
);

module.exports = common.db.model('person', schema, 'person');
