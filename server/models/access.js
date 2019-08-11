'use strict';

const sqlite3 = require('sqlite3');
const fs = require('fs');
const DBError = require('../errors').DBError;



function open(filename, next) {

    const db = new sqlite3.Database(filename);

    db.run(`
      CREATE TABLE IF NOT EXISTS access (
        treebank_id TEXT,
        username TEXT
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


  get_access(treebank_id, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      db.get('SELECT * FROM access WHERE treebank_id =?', treebank_id, (err, data) => {
          if (err) {
            return next(new DBError(err), null);
          }

          next(null, data);
        }
      );


    });
  }




  arrange(grant_access_flag, corpus_id, username, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (!corpus_id || !username)
        return next(new DBError('Missing required argument: corpus and username'), null);

      const sql = grant_access_flag ?
            'INSERT INTO access (corpus_id, username) VALUES (?, ?)' :
            'DELETE FROM access WHERE corpus_id=? AND username = ?';
            
      db.run(sql, corpus_id, username, function (err) {
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
