var Promise = require('bluebird');
var mongoose = require('mongoose');

module.exports = PostMongoRepository;

function PostMongoRepository(db) {
  this.db = db;
  
  var schema = new mongoose.Schema({
    title: String,
    text: String,
    created_at: Date
  });
  
  this.model = db.model('Post', schema);
  Promise.promisifyAll(this.model);
  Promise.promisifyAll(this.model.prototype);
}

PostMongoRepository.prototype.init = function() {
  //do nothing
}

PostMongoRepository.prototype.get = function(id) {
  return this.model.findByIdAsync(id).then(transformDoc)
}

PostMongoRepository.prototype.getAll = function() {
  return this.model.findAsync({}).then(function(ret) {
    return ret.map(transformDoc)
  });
}

PostMongoRepository.prototype.post = function(data) {

  var d = new this.model(data);
  return d.saveAsync().then(function(doc) {
    return doc[0]._id.toString();
  })
  
}

PostMongoRepository.prototype.put = function(id, data) {
  return this.model.updateAsync({
    _id: id
  }, data);
}

PostMongoRepository.prototype.delete = function(id) {
  return this.model.removeAsync({
    _id: id
  });
}

PostMongoRepository.prototype.deleteAll = function() {
  return this.model.removeAsync({});
}


function transformDoc(doc) {
  if(!doc) {
    return doc;
  }
  
  var d = doc.toObject({
    versionKey: false
  });

  d.id = d._id;
  delete d._id;

  return d;
}