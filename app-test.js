var jsonApi = require("jsonapi-server");
var MongoStore = require("jsonapi-store-mongodb");
var Joi = require('joi')

var testdate = Joi.date().format('YYYY-MM-DD')
Joi.validate('2017-06-29', testdate, function(err, result){
	console.log( err, result )
})



jsonApi.setConfig({
	port: 4000,
	base: ""
});

var handler = new MongoStore({
	url: "mongodb://localhost:27017/test2",
});

jsonApi.define({
  resource: "photos",
  // handlers1: new jsonApi.MemoryHandler(),
  handlers: handler,
  attributes: {
    title: jsonApi.Joi.string(),
    url: jsonApi.Joi.string().uri(),
    height: jsonApi.Joi.number().min(1).max(10000).precision(0),
    width: jsonApi.Joi.number().min(1).max(10000).precision(0)
  }
});

jsonApi.start();

setTimeout(function  () {
	jsonApi.define({
	  resource: "photos2",
	  handlers: handler,
	  attributes: {
	    title: jsonApi.Joi.string(),
	    url: jsonApi.Joi.string().uri(),
	    height: jsonApi.Joi.number().min(1).max(10000).precision(0),
	    width: jsonApi.Joi.number().min(1).max(10000).precision(0)
	  }
	});
}, 10000)

var s = {
	    title: jsonApi.Joi.string().meta( function(){return 'sodijf'} ),
	    url: jsonApi.Joi.string().uri(),
	    height: jsonApi.Joi.number().min(1).max(10000).precision(0),
	    width: jsonApi.Joi.number().min(1).max(10000).precision(0)
	  }
for(var i in s){
	console.log(i, s[i]._meta.pop() )
}

