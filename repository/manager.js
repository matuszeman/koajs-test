var Joi = require('joi');
var Promise = require('bluebird');

module.exports = RepositoryManager;

function RepositoryManager(options) {
  validateOptions(options);

  this.options = options;
  this.db = createDb(options.type, options.options);
  
  this.repositories = [];
}

RepositoryManager.prototype.init = function() {
  //TODO migrations might go here
  
  return Promise.all([
    this.get('post').init()
  ])
}

RepositoryManager.prototype.get = function(name) {
  
  if(!this.repositories[name]) {
    var Repo = require('./' + name + '.' + this.options.type);
    this.repositories[name] = new Repo(this.db);
  }
  
  return this.repositories[name];
}

function validateOptions(options) {
  var mongoOptionsSchema = Joi.object().required().keys({
    host: Joi.string().required()
  });

  var sqliteOptionsSchema = Joi.object().required().keys({
    file: Joi.string().required()
  });
  
  var result = Joi.validate(options, {
    type: Joi.string().required().valid(['mongo', 'sqlite']),
    options: Joi.when('type', {
        is: 'sqlite',
        then: sqliteOptionsSchema,
        otherwise: Joi.when('type', {
          is: 'mongo',
          then: mongoOptionsSchema
        })
      })
  });
  
  if(result.error) {
    throw "RepositoryManager: Options error: " + result.error;
  }
  
}

function createDb(type, options) {

  if(type === 'sqlite') {
    var sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(options.file);
  }

  if(type === 'mongo') {
    var db = require('monk')(options.host);
    return db;
  }
  
  throw "RepositoryManager: Not implemented repository type: " + type;
}