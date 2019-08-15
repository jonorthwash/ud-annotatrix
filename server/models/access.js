'use strict';

const sqlite3 = require('sqlite3');
const fs = require('fs');
const DBError = require('../errors').DBError;



function open(filename, next) {

    const db = new sqlite3.Database(filename);

    db.run(`
      CREATE TABLE IF NOT EXISTS access (
        treebank_id TEXT,
        username TEXT,
        UNIQUE(treebank_id, username)
      )`, err => next(err, db));

}



class AccessDB {
  constructor(filename) {
    if (!filename)
      throw new DBError('Missing required argument: filename');

    this.path = filename + '.db';
  }


  remove_corpus(treebank_id, next) {
    open(this.path, (err, db) => {
      if (err){
        return next(new DBError(err), null);
      }

      if (!treebank_id)
        return next(new DBError('Missing required param: treebank_id'), null);

      db.run('DELETE FROM access WHERE corpus_id=?', treebank_id, function (err) {
          if (err) {
            return next(new DBError(err), null);
          }

          next(null, { id: this.lastID, changes: this.changes });
        }
      );
    });
  }


  list(treebank_id, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      const args = treebank_id ?
            ['SELECT * FROM access WHERE treebank_id =?', treebank_id]:
            ['SELECT * FROM access'];

      db.all(...args, (err, data) => {
          if (err) {
            return next(new DBError(err), null);
          }

          next(null, data);
        }
      );


    });
  }




  arrange(treebank_id, username, grant_access_flag, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      if (!treebank_id || !username){
        return next(new DBError('Missing required argument: treebank_id and username'), null);
      }

      const sql = grant_access_flag ?
            'INSERT OR REPLACE INTO access (treebank_id, username) VALUES (?, ?)' :
            'DELETE FROM access WHERE treebank_id=? AND username = ?';

      db.run(sql, treebank_id, username, function (err) {
          if (err) {
            return next(new DBError(err), null);
          }

          next(null, { id: this.lastID, changes: this.changes });
        }
      );
    });
  }
}



module.exports = filename => new AccessDB(filename);
