'use strict';
var path     = require('path')
  , express  = require('express')
  , API      = require('json-api')
  , APIError = API.types.Error
  , mongoose = require('mongoose')
  , common = require('./common')


function identity(it) { return it; }

var models = {
  person: require('./models/person'),
  formtype: require('./models/formtype'),
}

// And registering them with the json-api library.
// Below, we load up every resource type and give each the same adapter; in
// theory, though, different types could be powered by different dbs/adapters.
// Check /resource-desciptions/school.js to see some of the advanced features.
var adapter = new API.dbAdapters.Mongoose(models, {singular: identity, plural: identity});
var registry = new API.ResourceTypeRegistry({
  person: require('./apidef/person'),
  formtype: require('./apidef/formtype'),
}, { dbAdapter: adapter });

var Controller = new API.controllers.API(registry);

// Initialize the automatic documentation.
var Docs = new API.controllers.Documentation(registry, {name: 'JSON API'});

// Initialize the express app + front controller.
var app = express();

var Front = new API.httpStrategies.Express(Controller, Docs);
var apiReqHandler = Front.apiRequest.bind(Front);

// Enable CORS. Note: if you copy this code into production, you may want to
// disable this. See https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
// http://stackoverflow.com/questions/11001817/allow-cors-rest-request-to-a-express-node-js-application-on-heroku
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain)

// Now, add the routes.
// To do this in a more scalable and configurable way, check out
// http://github.com/ethanresnick/express-simple-router. To protect some
// routes, check out http://github.com/ethanresnick/express-simple-firewall.
app.get("/", function(req,res){ res.end() });
// app.get("/", Front.docsRequest.bind(Front));


app.route("/:type(person|formtype)")
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler);
app.route("/:type(person|formtype)/:id")
  .get(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);
app.route("/:type(person|formtype)/:id/relationships/:relationship")
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);

app.use(function(req, res, next) {
  Front.sendError(new APIError(404, undefined, 'Not Found'), req, res);
});

// And we're done! Start 'er up!
console.log('Starting up! Visit '+ common.host +' to see the docs.');
app.listen( common.port );
