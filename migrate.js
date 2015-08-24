var RepositoryManager = require('./repository/manager');

var config = require('./config/server');
console.log('App config:', config); //XXX

//API: posts
var manager = new RepositoryManager(config.repositoryManager);
manager.init().then(function(ret) {
  console.log('Repository init done: ', ret);
}).catch(function(err) {
  console.log('Repository init error: ', err);
})