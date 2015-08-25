var _ = require('lodash');

var defaultConfig = {
  port: 3000,
  repositoryManager: {}
}

var env = process.env.NODE_ENV;
if(!env || ['prod', 'dev', 'test'].indexOf(env) === -1) {
  throw "NODE_ENV not set - possible values: 'prod', 'dev', 'test'";
}

var envConfigs = {
  prod: {
    repositoryManager: {
      type: 'mongo',
      options: {
        url: 'mongodb://localhost:27017/prod'
      }
    }
  },
  dev: {
    repositoryManager: {
      type: 'sqlite',
      options: {
        file: './data/dev.sqlite'
      }
    }
  },
  test: {
    repositoryManager: {
      type: 'sqlite',
      options: {
        file: ':memory:'
      }
    },
    mongoConnection: {
      url: 'mongodb://localhost:27017/test'
    }
  }
}


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

var localConfig = null;
if(env !== 'test') {
  localConfig = require('./server.local.js');
}

module.exports = _.assign(defaultConfig, envConfig, localConfig);

