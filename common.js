'use strict';
var mongoose = require('mongoose')

var port = 3000;
var host = 'http://1111hui.com:'+port;
var dbName = 'test2'
var db = mongoose.createConnection('mongodb://localhost/'+dbName)

module.exports = {
  host:host,
  dbName:dbName,
  db:db
}

