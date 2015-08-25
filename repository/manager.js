var Joi = require('joi');
var Promise = require('bluebird');
var mongoose = require('./mongoose');
var sqlite3 = require('sqlite3').verbose();

module.exports = RepositoryManager;

function RepositoryManager(options) {
  validateOptions(options);

  this.options = options;
  
  this.db = null;
  this.repositories = [];
}

RepositoryManager.prototype.init = function() {
  var self = this;

  //TODO migrations might go here
  return self.get('post').then(function(repo) {
    return repo.init()
  });
}

RepositoryManager.prototype.get = function(name) {
  var self = this;
  
  if(self.db) {
    return Promise.resolve(createRepo(self.db));
  }
  
  return openDb(self.options.type, self.options.options).then(function(db) {
    self.db = db;
    return createRepo(db);
  })

  function createRepo(db) {

    if(!self.repositories[name]) {
      var Repo = require('./' + name + '.' + self.options.type);
      self.repositories[name] = new Repo(db);
    }

    return self.repositories[name];
  }
  
}

function validateOptions(options) {
  var mongoOptionsSchema = Joi.object().required().keys({
    url: Joi.string().required()
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

function openDb(type, options) {

  if(type === 'sqlite') {
    return Promise.resolve(new sqlite3.Database(options.file));
  }

  if(type === 'mongo') {
    return new Promise(function(resolve, reject) {
      var db = mongoose.createConnection(options.url);
      db.once('open', function(rr) {
        return resolve(db);
      })

      db.on('error', reject);
    })
  }
  
  return Promise.reject("RepositoryManager: Not implemented repository type: " + type);
}