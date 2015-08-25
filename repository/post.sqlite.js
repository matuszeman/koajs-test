var Promise = require('bluebird');

module.exports = PostSqliteRepository;

function PostSqliteRepository(db) {
  this.db = db;
  this.selectColumns = 'id, title, text, created_at';
  this.table = 'post';
}

PostSqliteRepository.prototype.init = function() {
  return this._run('CREATE TABLE IF NOT EXISTS ' + this.table + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, `text` TEXT, created_at DATETIME)');
}

PostSqliteRepository.prototype.get = function(id) {
  return this._get('SELECT ' + this.selectColumns + ' FROM ' + this.table + ' WHERE id = $id', {
    $id: id
  }).then(function(doc) {
    return transformDoc(doc);
  });
}

PostSqliteRepository.prototype.getAll = function() {
  return this._getAll('SELECT ' + this.selectColumns + ' FROM ' + this.table).then(function(ret) {
    return ret.map(transformDoc);
  });
}

PostSqliteRepository.prototype.post = function(data) {
  
  return this._insert('INSERT INTO ' + this.table + ' (title, text, created_at) VALUES ($title, $text, $createdAt)', {
    $title: data.title,
    $text: data.text,
    $createdAt: data.created_at
  });
  
}

PostSqliteRepository.prototype.put = function(id, data) {

  return this._run('UPDATE ' + this.table + ' SET title = $title, text = $text WHERE id = $id', {
    $id: id,
    $title: data.title,
    $text: data.text
  });

}

PostSqliteRepository.prototype.delete = function(id) {

  return this._run('DELETE FROM ' + this.table + ' WHERE id = $id', {
    $id: id
  });

}

PostSqliteRepository.prototype.deleteAll = function(id) {
  return this._run('DELETE FROM ' + this.table);
}

PostSqliteRepository.prototype._run = function(query, params) {
  return Promise.promisify(this.db.run, this.db)(query, params);
}

PostSqliteRepository.prototype._getAll = function(query, params) {
  var self = this;

  return new Promise((resolve, reject) => {
    self.db.all(query, params, function(err, res) {
      if(err) {
        throw err;
      }

      resolve(res);
    })
  })

  return Promise.promisify(this.db.run, this.db)(query, params);
}

PostSqliteRepository.prototype._get = function(query, params) {
  var self = this;
  
  return new Promise((resolve, reject) => {
    //TODO mz: db.get didn't return anything here for some reason
    self.db.all(query, params, function(err, res) {
      
      if(err) {
        throw err;
      }

      if(res.length === 0) {
        return resolve();
      }

      resolve(res[0]);
    })
  })
  
  return Promise.promisify(this.db.run, this.db)(query, params);
}

PostSqliteRepository.prototype._insert = function(query, params) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.db.run(query, params, function(err, res) {
      if(err) {
        throw err;
      }
      
      resolve(this.lastID);
    })
  })
}

function transformDoc(doc) {
  if(!doc) {
    return doc;
  }
  
  if(doc.created_at) {
    doc.created_at = new Date(doc.created_at)
  }
  
  return doc;
}