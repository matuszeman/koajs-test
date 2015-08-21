var koa = require('koa');
var hal = require('halson');
var koahal = require('koa-hal');
var _ = require('lodash');
var router = require('koa-joi-router');
var Joi = router.Joi;

var RepositoryManager = require('./repository/manager');

var config = _.assign(require('./config/server'), require('./config/server.local.js'));
console.log('App config:', config); //XXX

//API: posts
var manager = new RepositoryManager(config.repositoryManager);
var postRepository = manager.get('post');

var apiPostRouter = router();

apiPostRouter.router.prefix('/posts');

apiPostRouter.route({
  method: 'get',
  path: '/',
  handler: function*() {
    var items = yield postRepository.getAll();

    var resource = hal();
    
    var halItems = items.map((item) => {
      return createPostHal(item);
    })
    
    resource.addEmbed('items', halItems);
    
    this.body = resource;
  }
});

apiPostRouter.route({
  method: 'get',
  path: '/:id',
  validate: {
    params: {
      id: Joi.string().required()
    }
  },
  handler: function*() {
    var item = yield postRepository.get(this.params.id);
    
    if(!item) {
      this.status = 404;
      return;
    }

    this.body = createPostHal(item);
  }
});

apiPostRouter.route({
  method: 'post',
  path: '/',
  validate: {
    body: {
      title: Joi.string().required(),
      text: Joi.string().required()
    },
    type: 'json'
  },
  handler: function*() {
    var itemId = yield postRepository.post(this.request.body);
    
    this.status = 201;
    this.body = createPostHal(itemId);
  }
});

apiPostRouter.route({
  method: 'put',
  path: '/:id',
  validate: {
    body: {
      title: Joi.string().required(),
      text: Joi.string().required()
    },
    params: {
      id: Joi.string().required()
    },
    type: 'json'
  },
  handler: function*() {
    var id = this.params.id;
    
    yield postRepository.put(id, this.request.body);

    this.body = createPostHal(id);
  }
});

apiPostRouter.route({
  method: 'delete',
  path: '/',
  handler: function*(){
    yield postRepository.deleteAll();

    this.status = 204;
  }
});

apiPostRouter.route({
  method: 'delete',
  path: '/:id',
  validate: {
    params: {
      id: Joi.string().required()
    }
  },
  handler: function*() {
    var id = this.params.id;

    yield postRepository.delete(id);
    
    this.status = 204;
  }
});

function createPostHal(item) {
  var resource, id;
  
  if(_.isObject(item)) {
    resource = hal(item);
    id = item.id;
  } else {
    resource = hal();
    id = item;
  }
  
  resource.addLink('self', '/posts/' + id);
  
  return resource;
}

//APP INIT
init().then(function() {
  var app = koa();
  app.use(koahal());
  app.use(apiPostRouter.middleware());
  app.listen(config.port);
})

function init() {
  return manager.init()
}

