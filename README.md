KoaJS test app
--------------

To run:

```
node --harmony
```

API endpoint: http://localhost:3000/posts

__Configuration:__

File: `config/server`

Among default configuration this also implements three environments (test, dev, prod) which are selected depending on NODE_ENV value.  
`index.js` also implements 3rd level configuration - local config `server.local.js` which MUST NOT be committed into RCS.  
This should only include deployment specific configuration like database username/password.


__DB implementations__

* mongodb - `repository/post.mongo`
* sqlite - `repository/post.sqlite`

`repository/manager` works as factory for database connection and repositories.  
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
=====================

- Create route factory where you would just inject repository object and all routes would be created - now it's hardcoded for post repository only
- Split env configs into individual files
- Refactor `repository/post.sqlite` and `repository/post.mongo` and create 'abstract classes' for sqlite and mongodb repositories. 
- Implement API Problem responses (application/problem+json)
- ... many more ;)