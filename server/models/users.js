'use strict';

const sqlite3 = require('sqlite3');
const fs = require('fs');
const DBError = require('../errors').DBError;



function open(filename, next) {

    const db = new sqlite3.Database(filename);

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username UNIQUE,
        email TEXT,
        realname TEXT,
        token UNIQUE
      )`, err => next(err, db));

}



class UsersDB {
  constructor(filename) {
    if (!filename)
      throw new DBError('Missing required argument: filename');

    this.path = filename + '.db';
  }


  insert(params, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (!params || (!params.username && !params.token))
        return next(new DBError('Missing required param: username OR token'), null);

      db.run('INSERT INTO users (username, token, email, realname) VALUES (?, ?, ?, ?)'
        , params.username || null
        , params.token || null
        , params.email || null
        , params.realname || null
        , function (err) { // don't use an anonymous function b/c we need this-binding
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

        db.get('SELECT * FROM users WHERE username = (?) or token = (?)'
          , params.username
          , params.token
          , (err, data) => {
            if (err)
              return next(new DBError(err), null);

            next(null, data);
          }
        );

      } else {

        db.all('SELECT * FROM users', (err, data) => {
          if (err)
            return next(new DBError(err), null);

          next(null, data);
        });

      }
    });
  }


  update(params, values, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (!params || !values)
        return next(new DBError('Missing required arguments: params AND values'), null);

      this.query(params, (err, data) => {
        if (err)
          return next(new DBError(err), null);

        if (data) { // it already exists, overwrite

          db.run(`
            UPDATE users
            SET username=IFNULL(?, username), token=IFNULL(?, username),
            email=IFNULL(?, email),
            realname=IFNULL(?, realname)
            WHERE id=(?) OR username=(?) OR token=(?)`
            , values.username
            , values.token
            , values.email
            , values.realname
            , params.id
            , params.username
            , params.token
            , function (err) {
              if (err)
                return next(new DBError(err), null);

              next(null, { id: this.lastID, changes: this.changes });
            }
          );

        } else { // insert new
          this.insert({
            email: values.email || params.email,
            realname: values.realname || params.realname,
            username: values.username || params.username,
            token: values.token || params.token
          }, next);
        }
      });
    });
  }


  remove(params, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (!params)
        return next(new DBError('Missing required argument: params'), null);

      db.run(`
        DELETE FROM users
        WHERE id=(?) OR username=(?) OR token=(?)`
        , params.id
        , params.username
        , params.token
        , function (err) {
          if (err)
            return next(new DBError(err), null);

          next(null, { id: this.lastID, changes: this.changes });
        }
      );
    });
  }
}



module.exports = filename => new UsersDB(filename);
