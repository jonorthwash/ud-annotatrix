'use strict';

const cfg = require('./config');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

class CorpusDB {
  constructor(filename, callback) {
    this.path = path.join(cfg.corpora_path, filename + '.db');
    if (fs.existsSync(this.path)) {
      this.db = new sqlite3.Database(this.path);
    } else {
      this.db = new sqlite3.Database(this.path);
      this.create();
    }

    this.db.close();
  }

  create() {
    this.db.serialize(() => {
      this.db.run('CREATE TABLE corpus (num integer primary key, sent)')
      this.db.run('CREATE TABLE meta (num integer primary key, filename, gui, labeler)')
      this.db.run('CREATE TABLE users (id integer primary key, username, token)')

      /*
      var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      for (var i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
      }
      stmt.finalize();

      db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
          console.log(row.id + ": " + row.info);
      });
      */
    });
  }
}

module.exports = CorpusDB;
