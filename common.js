'use strict';
var mongoose = require('mongoose')

var host = 'http://1111hui.com:4000'
var dbName = 'test2'
var db = mongoose.createConnection('mongodb://localhost/'+dbName)

module.exports = {
  host:host,
  dbName:dbName, 
  db:db
}

