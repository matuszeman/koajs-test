KoaJS test app
==============

An application to test RESTful API development using KoaJS. The app implements the endpoints below following [HAL specification](http://stateless.co/hal_specification.html):

GET    /posts     - lists all of the available posts  
POST   /posts     - create a new post with a title and text properties  
GET    /posts/:id - returns details about a post (id, title, text, created_at)  
PUT    /posts/:id - updates a post  
DELETE /posts/:id - deletes a post  
DELETE /posts     - deletes all posts  


Implements two storage types (mongo, sqlite) which can be selected from config file. 
 

__Installation__

```
npm install
```

Set NODE_ENV to either prod/dev and create local config file

```
export NODE_ENV=dev

cp config/server.local.js.sample config/server.local.js
```

DB setup

This initialize repository i.e. create sqlite table for posts (if sqlite repo is selected in config, this does nothing for mongo repo)

```
node --harmony migrate.js
```

___Note:___ Migrations are ran manually, so for obvious reasons, server with :memory: storage won't work with the server.


__To run:__

```
node --harmony index.js
```

API endpoint: http://localhost:3000/posts


__To run tests:__

```
make test
```


__Configuration:__

File: `config/server`

Among default configuration this also implements three environments (test, dev, prod) which are selected depending on NODE_ENV value.  
Default env config values can be overwritten by local config `server.local.js` which MUST NOT be committed into RCS.
This file might include deployment specific or sensitive values like database username/password.


DB implementations
------------------

* mongodb - `repository/post.mongo`
* sqlite - `repository/post.sqlite`

`repository/manager` works as factory and singleton for database connection and repositories.  
Calling `repository.get('post')` creates a repository instance for posts. Depending on config file, mongodb or sqlite is selected.  
Additional repositories could be implemented in `repository` folder following this file naming convention: 'REPOSITORY_NAME.DB_TYPE.js'.  

Manager automatically injects particular DB connection object into newly created repository object as first parameter.

Both post repositories have this interface:

- init() => promise / undefined
- get(id) => promise resolve(item)
- getAll() => promise resolve(items)
- post(data) => promise resolve(itemId)
- put(id, data) => promise resolve()
- delete(id) => promise resolve()
- deleteAll() => promise resolve()



Possible improvements
---------------------

- Split env configs into individual files
- Refactor `repository/post.sqlite` and `repository/post.mongo` and create 'abstract classes' for sqlite and mongodb repositories. 
- Implement API Problem responses (application/problem+json)
- Create route factory where you would just inject repository object and all routes would be created - now it's hardcoded for post repository only
