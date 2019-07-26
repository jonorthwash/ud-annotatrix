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
              pr_at TIMESTAMP
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


  query(params, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (params) {

        db.get('SELECT * FROM corpora WHERE treebank_id = ?',
          params, (err, data) => {
            logger.info(err, data);
            if (err) {
              return next(new DBError(err), null);
            }

            next(null, data);
          }
        );

      }

    });
  }


  update(treebank_id, column, next) {
    open(this.path, (err, db) => {
      if (err) {
        return next(new DBError(err), null);
      }

      if (!treebank_id || !column) {
        return next(new DBError('Missing required arguments: treebank_id AND column'), null);
        }

        const col  = (column === "committed_at") ? column : "pr_at";
        db.run("UPDATE corpora SET " + col + " = datetime('now') WHERE treebank_id=?",
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
