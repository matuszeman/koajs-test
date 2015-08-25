var request = require('supertest');
var expect = require('chai').expect

var index = require('../..');
var app = index.app;
var repositoryManager = index.repositoryManager;

var agent, postRepository;

beforeEach(function(done) {
  
  agent = request.agent(app.callback());
  
  return repositoryManager.init().then(function() {
    return repositoryManager.get('post');
  }).then(function(repo) {
    postRepository = repo;
  }).then(function(repo) {
    return postRepository.deleteAll();
  }).then(function() {
    done();
  });
  
});

afterEach(function(done) {
  postRepository.deleteAll().then(function() {
    done();
  });
})

describe('API v1 "post"', function() {
  
  describe('GET /posts - lists all of the available posts', function() {

    beforeEach(function(done) {
      postRepository.post({
        title: 'TEST_TITLE',
        text: 'TEST_TEXT'
      }).then(function(id) {
        done();
      });
    });
    
    it('return 200 with HAL collection', function (done) {
      agent.get('/posts')
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          
          expect(res.body).to.have.deep.property('_embedded.items')
            .that.is.an('array').have.length(1)
          
          done();
        });
    });
    
  });

  
  describe('POST /posts - create a new post with a title and text properties', function() {

    it('return 210 - empty HAL entity with link to just created item', function(done) {
      agent.post('/posts')
        .send({
          title: 'TEST_TITLE',
          text: 'TEST_TEXT'
        })
        .expect(201)
        .end(function(err, res){
          if (err) return done(err);

          expect(res.body).to.have.deep.property('_links.self.href')
          
          agent.get(res.body._links.self.href)
            .expect(200).end(function(err, res) {
              if (err) return done(err);
              
              done();
            });
        });
    });

    it('return 422 - missing title', function(done) {
      agent.post('/posts')
        .send({
          text: 'TEST_TEXT'
        })
        .expect(422)
        .end(function(err, res){
          if(err) return done(err);

          done();
        });
    });

    it('return 422 - missing text', function(done) {
      agent.post('/posts')
        .send({
          title: 'TEST_TITLE'
        })
        .expect(422)
        .end(function(err, res){
          if(err) return done(err);

          done();
        });
    });

  });
  

  describe('GET /posts/:id - returns details about a post (id, title, text, created_at)', function() {
    
    var postId;
      
    beforeEach(function(done) {
      postRepository.post({
        title: 'TEST_TITLE',
        text: 'TEST_TEXT'
      }).then(function(id) {
        postId = id;
        done();
      });
    });
    
    it('return 200 - with HAL entity', function(done) {
      agent.get('/posts/' + postId)
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          
          expect(res.body.id).to.equal(postId)
          expect(res.body.title).to.equal('TEST_TITLE')
          expect(res.body.text).to.equal('TEST_TEXT')
          
          expect(res.body).to.have.property('created_at');
          
          done();
        });
    });

    it('return 404 - not existing ID', function(done) {
      agent.get('/posts/NOT_EXISTING_ID')
        .expect(404)
        .end(function(err, res){
          if (err) return done(err);

          done();
        });
    });
  });


  describe('PUT /posts/:id - updates a post', function() {
    var postId;

    beforeEach(function(done) {
      postRepository.post({
        title: 'TEST_TITLE',
        text: 'TEST_TEXT'
      }).then(function(id) {
        postId = id;
        done();
      });
    });

    it('return 200 - with empty HAL entity with self link', function(done) {

      agent.put('/posts/' + postId)
        .send({
          title: 'NEW_TITLE',
          text: 'NEW_TEXT'
        })
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);

          expect(res.body).to.have.deep.property('_links.self.href')
          
          agent.get(res.body._links.self.href)
            .expect(200).end(function(err, res) {
              if (err) return done(err);

              expect(res.body.id).to.equal(postId)
              expect(res.body.title).to.equal('NEW_TITLE')
              expect(res.body.text).to.equal('NEW_TEXT')
              
              done();
            });
        });
    });

    it('return 404 - not existing ID', function(done) {
      agent.put('/posts/NOT_EXISTING_ID')
        .send({
          title: 'NEW_TITLE',
          text: 'NEW_TEXT'
        })
        .expect(404)
        .end(function(err, res){
          if (err) return done(err);

          done();
        });
    });

    it('return 422 - missing title', function(done) {
      agent.put('/posts/' + postId)
        .send({
          text: 'TEST_TEXT'
        })
        .expect(422)
        .end(function(err, res){
          if(err) return done(err);

          done();
        });
    });

    it('return 422 - missing text', function(done) {
      agent.put('/posts/' + postId)
        .send({
          title: 'TEST_TITLE'
        })
        .expect(422)
        .end(function(err, res){
          if(err) return done(err);

          done();
        });
    });
  })


  describe('DELETE /posts/:id - deletes a post', function() {
    var postId;

    beforeEach(function(done) {
      postRepository.post({
        title: 'TEST_TITLE',
        text: 'TEST_TEXT'
      }).then(function(id) {
        postId = id;
        done();
      });
    });

    it('return 204 - with no content', function(done) {

      agent.delete('/posts/' + postId)
        .expect(204)
        .end(function(err, res){
          if (err) return done(err);
          
          done();
        });
    });

    it('return 404 - not existing ID', function(done) {

      agent.delete('/posts/NOT_EXISTING_ID')
        .expect(404)
        .end(function(err, res){
          if (err) return done(err);

          done();
        });
    });
    
  })

  describe('DELETE /posts     - deletes all posts', function() {

    beforeEach(function(done) {
      
      Promise.all([
        postRepository.post({
          title: 'TEST_TITLE',
          text: 'TEST_TEXT'
        }),
        postRepository.post({
          title: 'TEST_TITLE',
          text: 'TEST_TEXT'
        })
      ]).then(function(id) {
        done();
      });
      
    });

    it('return 204 - with no content', function(done) {

      agent.delete('/posts')
        .expect(204)
        .end(function(err, res){
          if (err) return done(err);

          postRepository.getAll().then(function(ret) {
            expect(ret).have.length(0)
            done();
          }).catch(function(err) {
            done(err)
          })
          
        });
    });
    
  })

});