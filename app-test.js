var jsonApi = require("jsonapi-server");
var MongoStore = require("jsonapi-store-mongodb");

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

