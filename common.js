'use strict';
var mongoose = require('mongoose')

var port = 4000;
var host = 'http://1111hui.com:'+port;
var dbName = 'test2'

// http://stackoverflow.com/questions/10873199/how-to-handle-mongoose-db-connection-interruptions
var db = mongoose.createConnection();

db.on('error', function (err) {
	console.log(err)
  if (err) // couldn't connect
  // hack the driver to allow re-opening after initial network error
  db.db.close();
  // retry if desired
  connect();
});

db.on('open', function (ref) {
    console.log('open connection to mongo server.');
});

db.on('connected', function (ref) {
    console.log('connected to mongo server.');
});

function connect () {
  db.open('localhost', dbName);
}
connect();

// mongoose.connect('mongodb://127.0.0.1:27017/test2')

module.exports = {
  port:port,
  host:host,
  dbName:dbName,
  db:db
}

