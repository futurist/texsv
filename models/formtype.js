'use strict'
var mongoose = require('mongoose')
var common = require('../common')

var _ObjectId = mongoose.Schema.Types.ObjectId
var ObjectId = mongoose.Types.ObjectId
var Mixed = mongoose.Schema.Types.Mixed

var formTypeSchema = mongoose.Schema({

  name:{type:String},
  title:{type:String, default:''},
  mainKey:{type:String, default:'_id'},
  desc:{type:String, default:''},

  createAt:{ type: Date, default: function(){ return new Date() } },
  createBy:{type:_ObjectId , ref:'Person' },

  updateAt:{ type: Date, default: function(){ return new Date() } },
  updateBy:{type:_ObjectId , ref:'Person' },

  template: Mixed,
  dom: Mixed,

})

/**
 * Validations
 */

// formTypeSchema.path('name').required(true, 'formType name cannot be blank');

// formTypeSchema.pre('save', function (next) {
//   if (!this.createAt) this.createAt = new Date;
//   if (!this.updateAt) this.updateAt = this.createAt;
//   if (!this.updateBy) this.updateBy = this.createBy;
//   next();
// })

// formTypeSchema.pre('remove', function (next) {
//   next();
// })

// formTypeSchema.pre('validate', function (next) {
//   next();
// })

// formTypeSchema.methods = {  }
// formTypeSchema.statics = {  }

var formTypeModel = common.db.model('formtype', formTypeSchema, 'formtype')

module.exports = formTypeModel

