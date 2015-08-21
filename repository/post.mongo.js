//var AbstractRepository = require('./abstract-repository');
var Promise = require('bluebird');

module.exports = PostMongoRepository;

function PostMongoRepository(db) {
  this.db = db;
  this.collection = db.get('post');
}

PostMongoRepository.prototype.init = function() {
  //do nothing
}

PostMongoRepository.prototype.get = function(id) {
  return this.collection.findById(id).then(function(doc) {
    return transformDoc(doc);
  });
}

PostMongoRepository.prototype.getAll = function() {
  return this.collection.find({}).then(function(res) {
    return res.map(transformDoc);
  });
}

PostMongoRepository.prototype.post = function(data) {
  data.createdAt = new Date();
  return this.collection.insert(data).then(function(res) {
    return res._id.toString();
  });
}

PostMongoRepository.prototype.put = function(id, data) {
  return this.collection.updateById(id, data);
}

PostMongoRepository.prototype.delete = function(id) {

  return this.collection.remove({
    _id: id
  })

}

PostMongoRepository.prototype.deleteAll = function(id) {
  return this.collection.remove();
}


function transformDoc(doc) {
  doc.id = doc._id.toString();
  delete doc._id;
  
  return doc;
}