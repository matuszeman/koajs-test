var assert = require('chai').assert;
var expect = require('chai').expect;

var mongoose = require('./../../../repository/mongoose');
var PostMongoRepository = require('./../../../repository/post.mongo.js')

var config = require('./../../../config/server')

var db, repo;

describe('PostMongoRepository', function() {
  
  before(function(done) {
  
    var connectionConfig = config.mongoConnection;
    
    db = mongoose.connect(connectionConfig.url);
    repo = new PostMongoRepository(db);
    
    done();
  });
  
  
  after(function(done) {
    
    db.disconnect()
    
    done();
  });
  
  beforeEach(function(done) {
    
    repo.deleteAll().then(function() {
      done();
    });
    
  })
  
  describe('.getAll()', function() {
  
    beforeEach(function(done) {
  
      Promise.all([
        repo.post({
          title: 'TEST_TITLE1',
          text: 'TEST_TEXT1'
        }),
        repo.post({
          title: 'TEST_TITLE2',
          text: 'TEST_TEXT2'
        })
      ]).then(function() {
        done()
      })
      
    });
    
    it('should return two items', function(done) {
      repo.getAll().then(function(res) {
        expect(res).have.length(2);
        done()
      }).catch(function(err) {
        done(err)
      })
    })
    
  })
  
  describe('.get(id)', function() {
  
    var postId;
    
    beforeEach(function(done) {
  
      repo.post({
        title: 'TEST_TITLE1',
        text: 'TEST_TEXT1'
      }).then(function(id) {
        postId = id;
        done()
      })
  
    });
  
    it('should return entity', function(done) {
      repo.get(postId).then(function(res) {
        expect(res).to.have.all.keys('id', 'title', 'text');
        done()
      }).catch(function(err) {
        done(err)
      })
    })
  
  })
  
  describe('.post(data)', function() {
  
    it('should return new post ID', function(done) {
      repo.post({
        title: 'TEST_TITLE',
        text: 'TEST_TEXT'
      }).then(function(res) {
        expect(res).is.a('string');
        done()
      }).catch(function(err) {
        done(err)
      })
    })
  
  })
  
  
  describe('.put(id, data)', function() {
  
    var postId;
  
    beforeEach(function(done) {
  
      repo.post({
        title: 'TEST_TITLE1',
        text: 'TEST_TEXT1'
      }).then(function(id) {
        postId = id;
        done()
      })
  
    });
    
    it('should update existing doc', function(done) {
      repo.put(postId, {
        title: 'NEW_TITLE',
        text: 'NEW_TEXT'
      }).then(function(res) {
        return repo.get(postId);
      }).then(function(doc) {
        expect(doc).have.property('title').equals('NEW_TITLE');
        expect(doc).have.property('text').equals('NEW_TEXT');
        done()
      }).catch(function(err) {
        done(err)
      })
    })
  
  })
  
  describe('.delete(id)', function() {
  
    var postId;
  
    beforeEach(function(done) {
  
      repo.post({
        title: 'TEST_TITLE1',
        text: 'TEST_TEXT1'
      }).then(function(id) {
        postId = id;
        done()
      })
  
    });
  
    it('should delete existing record', function(done) {
      repo.delete(postId).then(function(res) {
        return repo.get(postId);
      }).then(function(doc) {
        expect(doc).to.not.exist;
        done()
      }).catch(function(err) {
        done(err)
      })
    })
  
  })
  
  describe('.deleteAll()', function() {
  
    var postId;
  
    beforeEach(function(done) {
  
      repo.post({
        title: 'TEST_TITLE1',
        text: 'TEST_TEXT1'
      }).then(function(id) {
        postId = id;
        done()
      })
  
    });
  
    it('should delete all records', function(done) {
      repo.deleteAll().then(function(res) {
        return repo.getAll();
      }).then(function(ret) {
        expect(ret).to.have.length(0);
        done()
      }).catch(function(err) {
        done(err)
      })
    })
  
  })
  
})