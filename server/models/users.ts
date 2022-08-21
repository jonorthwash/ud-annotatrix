import * as sqlite3 from "sqlite3";
import * as fs from "fs";
import {DBError} from "../errors";

function open(filename: string, next: (err: Error|null, db: sqlite3.Database) => void) {
  if (fs.existsSync(filename)) {

    next(null, new sqlite3.Database(filename));

  } else {

    const db = new sqlite3.Database(filename);
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username UNIQUE,
        token UNIQUE
      )`,
           err => next(err, db));
  }
}

interface Params {
  id?: unknown;
  username: unknown;
  token?: unknown;
}

interface UpdateValues {
  username?: unknown;
  token: unknown;
}

export class UsersDB {
  private path: string;

  private constructor(filename: string) {
    if (!filename)
      throw new DBError("Missing required argument: filename");

    this.path = filename + ".db";
  }

  insert(params: Params, next: (err: Error|null, data: {id: string, changes: unknown}) => void) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err.toString()), null);

      if (!params || (!params.username && !params.token))
        return next(new DBError("Missing required param: username OR token"), null);

      db.run("INSERT INTO users (username, token) VALUES (?, ?)", params.username || null, params.token || null,
             function(err: Error) { // don't use an anonymous function b/c we need this-binding
               if (err)
                 return next(new DBError(err.toString()), null);

               if (isNaN(parseInt(this.lastID)))
                 return next(new DBError("Unable to insert"), null);

               next(null, {id: this.lastID, changes: this.changes});
             });
    });
  }

  query(params: Params, next: (err: Error|null, data: unknown) => void) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err.toString()), null);

      if (params) {

        db.get("SELECT * FROM users WHERE username = (?) or token = (?)", params.username, params.token,
               (err: Error|null, data: unknown) => {
                 if (err)
                   return next(new DBError(err.toString()), null);

                 next(null, data);
               });

      } else {

        db.all("SELECT * FROM users", (err, data) => {
          if (err)
            return next(new DBError(err.toString()), null);

          next(null, data);
        });
      }
    });
  }

  update(params: Params, values: UpdateValues|null, next: (err: Error|null, data: {id: string, changes: unknown}) => void) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err.toString()), null);

      if (!params || !values)
        return next(new DBError("Missing required arguments: params AND values"), null);

      this.query(params, (err, data) => {
        if (err)
          return next(new DBError(err.toString()), null);

        if (data) { // it already exists, overwrite

          db.run(`
            UPDATE users
            SET username=IFNULL(?, username), token=IFNULL(?, username)
            WHERE id=(?) OR username=(?) OR token=(?)`,
                 values.username, values.token, params.id, params.username, params.token, function(err: Error|null) {
                   if (err)
                     return next(new DBError(err.toString()), null);

                   next(null, {id: this.lastID, changes: this.changes});
                 });

        } else { // insert new
          this.insert({username: values.username || params.username, token: values.token || params.token}, next);
        }
      });
    });
  }

  remove(params: Params, next: (err: Error|null, data: {id: string, changes: unknown}) => void) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err.toString()), null);

      if (!params)
        return next(new DBError("Missing required argument: params"), null);

      db.run(`
        DELETE FROM users
        WHERE id=(?) OR username=(?) OR token=(?)`,
             params.id, params.username, params.token, function(err: Error|null) {
               if (err)
                 return next(new DBError(err.toString()), null);

               next(null, {id: this.lastID, changes: this.changes});
             });
    });
  }

  public static create(filename: string): UsersDB {
    return new UsersDB(filename);
  }
}
