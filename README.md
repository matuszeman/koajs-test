KoaJS test app
==============

__To run:__

```
node --harmony index.js
```

API endpoint: http://localhost:3000/posts

__DB setup / migrations:__

This initialize repository i.e. create sqlite table for posts.

```
node --harmony migrate.js
```

___Note:___ We want to run migrations manually, so for obvious reasons, server with :memory: storage won't work.



__To run tests:__

```
make test
```


__Configuration:__

File: `config/server`

Among default configuration this also implements three environments (test, dev, prod) which are selected depending on NODE_ENV value.  
`index.js` also implements 3rd level configuration - local config `server.local.js` which MUST NOT be committed into RCS.  
This should only include deployment specific configuration like database username/password.


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
