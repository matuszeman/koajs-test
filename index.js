var koa = require('koa');
var hal = require('halson');
var koahal = require('koa-hal');
var _ = require('lodash');
var router = require('koa-joi-router');
var Joi = router.Joi;

var RepositoryManager = require('./repository/manager');

var config = require('./config/server');
console.log('App config:', config); //XXX

//API: posts
var repositoryManager = new RepositoryManager(config.repositoryManager);

var apiPostRouter = router();

apiPostRouter.router.prefix('/posts');

apiPostRouter.route({
  method: 'get',
  path: '/',
  handler: function*() {
    var postRepository = yield repositoryManager.get('post');
    
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
    var postRepository = yield repositoryManager.get('post');
    
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
    type: 'json',
    failure: 422,
    body: {
      title: Joi.string().required(),
      text: Joi.string().required()
    }
  },
  handler: function*() {
    var postRepository = yield repositoryManager.get('post');
    
    var data = this.request.body;
    data.created_at = new Date();
    
    var itemId = yield postRepository.post(data);
    
    this.status = 201;
    this.body = createPostHal(itemId);
  }
});

apiPostRouter.route({
  method: 'put',
  path: '/:id',
  validate: {
    type: 'json',
    failure: 422,
    params: {
      id: Joi.string().required()
    },
    body: {
      title: Joi.string().required(),
      text: Joi.string().required()
    }
  },
  handler: function*() {
    var postRepository = yield repositoryManager.get('post');
    
    var id = this.params.id;

    var entity = yield postRepository.get(id);
    if(!entity) {
      return this.status = 404;
    }
    
    yield postRepository.put(id, this.request.body);

    this.body = createPostHal(id);
  }
});

apiPostRouter.route({
  method: 'delete',
  path: '/',
  handler: function*() {
    var postRepository = yield repositoryManager.get('post');
    
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
    var postRepository = yield repositoryManager.get('post');
    
    var id = this.params.id;
    
    var entity = yield postRepository.get(id);
    if(!entity) {
      return this.status = 404;
    }

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
var app = koa();

app.use(koahal());
app.use(apiPostRouter.middleware());
app.listen(config.port);

module.exports = {
  app: app,
  repositoryManager: repositoryManager
};