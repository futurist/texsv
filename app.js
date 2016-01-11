var util = require("util");
var mongoose = require("mongoose");
var api = require("jsonapi-server");
var MongoStore = require("jsonapi-store-mongodb");
var typeInfo = require('./typeInfo');
var debug = require('./debug')

var API_BASE = '/json-api'
var MONGODB_URL = "mongodb://localhost:27017/test2"

api.setConfig({
	protocol: 'http',
	hostname: '127.0.0.1',
	port: 4000,
	base: API_BASE
});

typeInfo.setApi(api);
var BasePath = api._apiConfig.pathPrefix;

mongoose.connect(MONGODB_URL);

var handler = new MongoStore({
	url: MONGODB_URL,
}, api);

handler.on_initialise = function(resName, col) {
  debug.db('init', resName)
  handler._col = handler._col||{}
  handler._col[resName] = col;
  if(resName=='formtype'){
    col.find({}, {sort:{createAt:1} }).toArray(function(err, docs){
      docs.forEach(function(result){
        handler._db
        .collection('formtype_archive')
        .count( { 'live_version.id':result.id }, function(err, maxCount){
          debug.db('create', result.name, result.id, maxCount)
          typeInfo.createType(handler, maxCount||0, 'userform_'+ result.name, result.template )
        })
      })
    })
  }
}


handler.before_create = function(type, document){
	debug.db('before_create')
	return new Promise(function(resolve, reject){
		if(type=='formtype'){
			handler._db.collection(type).count({name:document.name}, function(err, count){
				if(count) reject("创建失败：命名重复，请改一下名称")
				else resolve()
			})
		}else{
			resolve()
		}
	})
}
handler.after_create = function(err, result, nextCallback){
  debug.db('after_create', err, result)
  if(result.type=='formtype'){
    typeInfo.createType(handler, 0, 'userform_'+ result.name, result.template )
  }
  nextCallback && nextCallback()
}


handler.before_delete = function(type, id) {
	debug.db('before_create')
	return new Promise(function(resolve, reject){
		resolve()
	})
}
handler.after_delete = function(err, result, type, id, nextCallback) {
  debug.db('after_delete', err, result.result )
  nextCallback && nextCallback()
}


handler.before_update = function(type, id, newData, it){
	// must return Promise
	return new Promise(function(resolve, reject){
	      resolve();
	})
}
handler.after_update = function(err, oldData, newData, nextCallback ){
  debug.db('after_update', err, oldData.name, newData.name)

  if(newData.type=='formtype') {

  	var col = handler._db.collection('formtype_archive')
  	col.count( { 'live_version.id':oldData.id }, function(err, maxCount){
  		debug.db('maxCount', err, maxCount)

  		// pass to next callback
	  	newData.version = maxCount+1
	  	handler._db.collection('formtype').updateOne({id:newData.id}, {$set:{version: maxCount+1}} );
	  	nextCallback && nextCallback()

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
			debug.db(err, status)
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
    version: api.Joi.number().default(0),
    // get all archive url is: /formtype_archive/?filter[live_version]=144d4f50-d650-4a54-81b3-045a424307dd
    formtype_archive: api.Joi.belongsToMany({ resource:'formtype_archive', as:'live_version' })
  }
});


api.start();

debug.app('api started at ', BasePath, 'port', api._apiConfig.port  )


