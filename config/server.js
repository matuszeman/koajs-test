var _ = require('lodash');

var defaultConfig = {
  port: 3000,
  repositoryManager: {}
}

var envConfigs = {
  prod: {
    type: 'mongo',
    options: {
      host: 'localhost/koajs'
    }
  },
  dev: {
    repositoryManager: {
      type: 'sqlite',
      options: {
        file: './data/db.sqlite'
      }
    }
  },
  test: {
    repositoryManager: {
      type: 'sqlite',
      options: {
        file: ':memory:'
      }
    }
  }
}

var env = process.env.NODE_ENV;
var envConfig = null;
if(env) {
  envConfig = envConfigs[env];
  
  if(envConfig) {
    console.log('Env config loaded: ' + env);
    //console.log(envConfig); //XXX
  }
  else {
    console.warn('Env config does not exist for: ' + env);
  }
}

module.exports = _.assign(defaultConfig, envConfig)

