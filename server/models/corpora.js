'use strict';

const sqlite3 = require('sqlite3');
const fs = require('fs');
const DBError = require('../errors').DBError;
const logger = require('../logger');



function open(filename, next) {

  const db = new sqlite3.Database(filename);

  db.run(`
    CREATE TABLE IF NOT EXISTS corpora (
              id INTEGER PRIMARY KEY,
              owner TEXT,
              repo TEXT,
              branch TEXT NOT NULL default master,
              username TEXT,
              url TEXT,
              filepath TEXT,
              filename TEXT,
              filesize INT,
              sha TEXT,
              treebank_id TEXT UNIQUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              committed_at TIMESTAMP,
              pr_at TIMESTAMP,
              open_access INTEGER
    )`, err => next(err, db));

}



class CorporaDB {
  constructor(filename) {
    if (!filename)
      throw new DBError('Missing required argument: filename');

    this.path = filename + '.db';
  }


  insert(params, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (!Array.isArray(params) || !params.length)
        return next(new DBError('Missing required param: username OR token'), null);

      db.run('INSERT INTO corpora (owner, repo, branch, username, url, filepath, filename, filesize, sha, treebank_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params, function (err) {
          if (err)
            return next(new DBError(err), null);

          if (isNaN(parseInt(this.lastID)))
            return next(new DBError('Unable to insert'), null);

          next(null, { id: this.lastID, changes: this.changes });
        }
      );
    });
  }


  all(next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      db.all('SELECT * FROM corpora', (err, data) => {

          if (err) {
            return next(new DBError(err), null);
          }

          data.forEach(x => (
              x.database_id = x.id,
              x.id  = x.treebank_id
            )
         );

          next(null, data);
      });

    });
  }


  query(params, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (params) {

        db.get('SELECT * FROM corpora WHERE treebank_id = ?',
          params, (err, data) => {

            if (err) {
              return next(new DBError(err), null);
            }

            next(null, data);
          }
        );

      }

    });
  }


  change_access(treebank_id, mode, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      if (!treebank_id || !mode) {
        return next(new DBError('Missing required arguments: treebank_id AND mode'), null);
        }

        db.run("UPDATE corpora SET open_access=? WHERE treebank_id=?",
          mode,
          treebank_id,
          function (err) {
            if (err){
              return next(new DBError(err), null);
            }

            next(null, { id: this.lastID, changes: this.changes });
          }
        );

    });
  }



  update_commit(treebank_id, sha, filesize, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      if (!treebank_id || !sha) {
        return next(new DBError('Missing required arguments: treebank_id, sha AND filesize'), null);
        }

        db.run("UPDATE corpora SET committed_at=datetime('now'), sha=?, filesize=? WHERE treebank_id=?",
          sha,
          filesize,
          treebank_id,
          function (err) {
            if (err){
              return next(new DBError(err), null);
            }

            next(null, { id: this.lastID, changes: this.changes });
          }
        );

    });
  }


  update_pr(treebank_id, state, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      if (!treebank_id || !column) {
        return next(new DBError('Missing required arguments: treebank_id AND column'), null);
      }

        const pr_val  = state ? "datetime('now')" : "NULL";
        db.run("UPDATE corpora SET pr_at = " + pr_val + " WHERE treebank_id=?",
          treebank_id,
          function (err) {
            if (err){
              return next(new DBError(err), null);
            }

            next(null, { id: this.lastID, changes: this.changes });
          }
        );

    });
  }


  remove(treebank_id, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      if (!treebank_id) {
        return next(new DBError('Missing required argument: treebank id'), null);
      }

      db.run("DELETE FROM corpora WHERE treebank_id = ?", treebank_id,
        function (err) {
          if (err) {
            return next(new DBError(err), null);
          }

          next(null, { id: this.lastID, changes: this.changes });
        }
      );
    });
  }
}



module.exports = filename => new CorporaDB(filename);
