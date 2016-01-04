var util = require("util");
var api = require("jsonapi-server");
var MongoStore = require("jsonapi-store-mongodb");

api.setConfig({
	port: 4000,
	base: "json-api"
});

var handler = new MongoStore({
	url: "mongodb://localhost:27017/test2",
}, api);

handler.on_create = function(err, result){
  console.log('on_create', err, result)
  if(result.type=='formtype'){
    createType( 'userform_'+ result.name, result.template )
  }
}
handler.on_delete = function(err, result, type, id) {
  console.log('on_delete', err, result.result )

}
handler.on_update = function(err, result, newData){
  console.log('on_update', err, result, newData)
  if(newData.type=='formtype') {
    createType( 'userform_'+ newData.name, newData.template )
  }
}

function getTypeInfo(dom){
  var info
  if( /input/i.test(dom.tag) && dom.attrs.type == "number" ){
    info = api.Joi.number();
  } else {
    info = api.Joi.string();
  }
  if(dom.attrs.required){
    info = info.required()
  }
  return info;
}

function createType(typeName, template){
  var attributes = {}
  for(var i in template) {
    attributes[ i ] = getTypeInfo( template[i] );
  }
  api.define( {resource: typeName, handlers:handler, attributes:attributes } )
}

api.define({
  resource: "person",
  // handlers1: new api.MemoryHandler(),
  handlers: handler,
  attributes: {
    name: api.Joi.string(),
    email: api.Joi.string().email(),
    parent: api.Joi.one('person'),
  }
});

api.define({
  resource: "formtype",
  handlers: handler,
  attributes: {
    name: api.Joi.string(),
    title: api.Joi.string().default(''),
    mainKey: api.Joi.string().default('id'),
    desc: api.Joi.string().allow(''),
    height: api.Joi.number().min(1).max(10000).precision(0),
    width: api.Joi.number().min(1).max(10000).precision(0),
    createAt: api.Joi.date().default(function(){ return new Date() }, 'time of creation'),
    createBy: api.Joi.one('person'),
    updateAt: api.Joi.date().default(function(){ return new Date() }, 'time of update'),
    updateBy: api.Joi.one('person'),
    template: api.Joi.any().allow([null,undefined,'']),
    dom: api.Joi.any().allow([null,undefined,'']),
  }
});


api.start();

console.log('api started at ', api._apiConfig.port  )


