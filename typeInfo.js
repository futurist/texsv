
var http = require('http')
var mongoose = require('mongoose')
var debug = require('./debug')

var Schema = mongoose.Schema
var typeInfo = module.exports = {}

var api = {}
function _getTypeInfo(dom){
  var info
  if( /input/i.test(dom.tag) && dom.attrs.type == "number" ){
    info = api.Joi.number();
  } else if( /span/i.test(dom.tag) ) {
    info = api.Joi.array();
  } else {
    info = api.Joi.string();
  }
  if(dom.attrs.required){
    info = info.required()
  }else{
    info = info.allow([null,''])
  }
  return info;
}

function _getMonGooseTypeSchema(dom){
  var info
  if( /input/i.test(dom.tag) && dom.attrs.type == "number" ){
    info = {type:String };
  } else if( /span/i.test(dom.tag) ) {
    info = {type:Array };
  } else {
  	info = api.Joi.string();
  }
  if(dom.attrs.required){
    info = info.required()
  }else{
    info = info.allow([null,''])
  }
  return info;
}

// http://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js
typeInfo.request = function request(method, path, data, callback) {
  // Build the post string from an object
  var json_data = JSON.stringify(data);

  var options = {
      hostname: 'localhost',
      port: '4000',
      path: path,
      method: method,
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Content-Length': Buffer.byteLength(json_data)
      }
  };

  // Set up the request
  var req = http.request(options, function(res) {
      var status = res.statusCode
      var headers = res.headers
      var body = '';
      debug.type('STATUS', status);
      debug.type('HEADERS', JSON.stringify(headers));

      // skip body, just return status code for fast speed!!!
      return callback&&callback(null, status, headers, body )

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          // console.log('Response: ' + chunk);
          body += chunk;
      });
      res.on('end', function() {
        // console.log('No more data in response.')
        callback&&callback(null, status, headers, body )
      })
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    callback&&callback(e)
  });

  // post the data
  req.write(json_data);
  req.end();
}


typeInfo.setApi = function(_api){ api = _api }
typeInfo.createType = function createType(handlers, version, typeName, template){
  var attributes = {}
  for(var i in template) {
    attributes[ i ] = _getTypeInfo( template[i] );
  }
  attributes.meta_form = api.Joi.one('formtype')
  attributes.meta_ver = api.Joi.number().default(version||0)
  var schema = {resource: typeName, handlers:handlers, attributes:attributes }
  //  here should comment JSONAPI-SERVER's validation
  api.define( schema )

  // mongoose def
  // mongoose.model(typeName, new Schema({ name: String }), typeName);
}


