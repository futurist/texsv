var util = require("util");
var api = require("jsonapi-server");
var MongoStore = require("jsonapi-store-mongodb");
var typeInfo = require('./typeInfo');

var API_HOST = 'http://1111hui.com'
var API_BASE = '/json-api'

api.setConfig({
	// protocol: 'http',
	// hostname: '1111hui.com',
	port: 4000,
	base: API_BASE
});

typeInfo.setApi(api);
var BasePath = api._apiConfig.pathPrefix;

var handler = new MongoStore({
	url: "mongodb://localhost:27017/test2",
}, api);

handler.on_initialise = function(resName, col) {
  // console.log('init ready', resName)
  handler._col = handler._col||{}
  handler._col[resName] = col;
  if(resName=='formtype'){
    col.find({}, {sort:{createAt:1} }).toArray(function(err, docs){
      docs.forEach(function(result){
        handler._db
        .collection('formtype_archive')
        .count( { 'value.id':result.id }, function(err, maxCount){
          // console.log('create', result.name, result.id, maxCount)
          typeInfo.createType(handler, maxCount||0, 'userform_'+ result.name, result.template )
        })
      })
    })
  }
}

handler.on_create = function(err, result){
  console.log('on_create', err, result)
  if(result.type=='formtype'){
    typeInfo.createType(handler, 0, 'userform_'+ result.name, result.template )
  }
}
handler.on_delete = function(err, result, type, id) {
  console.log('on_delete', err, result.result )
}
handler.on_update = function(err, oldData, newData){
  console.log('on_update', err, oldData.name, newData.name)

  if(newData.type=='formtype') {

  	var col = handler._db.collection('formtype_archive')
  	col.count( { 'value.id':oldData.id }, function(err, maxCount){
  		console.log('maxCount', err, maxCount)
	   var archiveData = {
	  		data:{
	  			type:'formtype_archive',
		  		attributes:{
		  			name:oldData.name,
		  			version: maxCount,
		  			operateBy:{type:'person', id:'19082b98-70ab-4d2a-8155-b3329e0296c6'},
		  			value:oldData,
		  			live_version: { type:'formtype', id:newData.id }
		  		}
	  		}
	  	}

		typeInfo.request('POST', API_BASE+'/formtype_archive', archiveData, function(err, status, header, body){
			console.log(err, status)
			typeInfo.createType( handler, maxCount+1, 'userform_'+ newData.name, newData.template )
		})

		// below native mongo code will not generate UUID, so we use api version
		// archiveData.data.attributes.type = archiveData.data.type;
		// col.insertOne( archiveData.data.attributes, function(err, result){
		// 	console.log(err, result)
		// } )

	})

  }
}


api.define({
  resource: "person",
  // handlers1: new api.MemoryHandler(),
  handlers: handler,
  attributes: {
    name: api.Joi.string(),
    email: api.Joi.string().email(),
    parent: api.Joi.one('person'),
    children: api.Joi.belongsToMany({
      resource: "person",
      as: "parent"
    }),
    formtypes: api.Joi.belongsToMany({ resource:'formtype', as:'formtypes' })
  }
});

// formtype history
api.define({
  resource: "formtype_archive",
  handlers: handler,
  attributes: {
    name: api.Joi.string(),
    version: api.Joi.number().default(0),
    operateAt: api.Joi.date().default(function(){ return new Date() }, 'time of archive'),
    operateBy: api.Joi.one('person'),
    value: api.Joi.object().optional(),
    live_version: api.Joi.one('formtype')
  }
})
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
    template: api.Joi.any().allow([null,'']),
    dom: api.Joi.any().allow([null,'']),
    // get all archive url is: /formtype_archive/?filter[live_version]=144d4f50-d650-4a54-81b3-045a424307dd
    formtype_archive: api.Joi.belongsToMany({ resource:'formtype_archive', as:'live_version' })
  }
});


api.start();

console.log('api started at ', BasePath, 'port', api._apiConfig.port  )


