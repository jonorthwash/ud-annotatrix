'use strict';

const cfg = require('../config');
const init = require('./corpus-init');
const sanitize = require('./sanitize');
const parse = require('./parse');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const DBError = require('../errors').DBError;


function open(filename, next) {

  if (fs.existsSync(filename)) {

    next( null, new sqlite3.Database(filename) );

  } else {

    const db = new sqlite3.Database(filename);
    db.exec(init, err => next(err, db));

  }
}



class CorpusDB {
  constructor(filename) {
    if (!filename)
      throw new DBError('Missing required argument: filename');

    this.path = path.join(cfg.corpora_path, filename + '.db');
  }

  getSentence(id, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      db.get('SELECT sentence FROM corpus WHERE rowid = (?)', id, (err, data) => {
        if (err)
          return next(new DBError(err), null);

        next(null, parse.sentence(data));
      });
    });
  }

  setSentence(id, sentence, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      if (sentence) {

        sentence = sanitize.sentence(sentence);
        this.getSentence(id, (err, data) => {
          if (err)
            return next(new DBError(err), null);

          if (data) { // it already exists, overwrite

            db.run(`UPDATE corpus SET sentence = (?) WHERE rowid = (?)`
              , sentence, id, function (err) {
                if (err)
                  return next(new DBError(err), null);

                next(null, { id: this.lastID, changes: this.changes });
              }
            );

          } else { // insert new

            db.run('INSERT INTO corpus (sentence) VALUES (?)', sentence, function (err) {
              if (err)
                return next(new DBError(err), null);

              if (isNaN(parseInt(this.lastID)))
                return next(new DBError('Unable to insert'), null);

              next(null, { id: this.lastID, changes: this.changes });
            });

          }
        });

      } else { // remove it

        db.run(`DELETE FROM corpus WHERE rowid = (?)`, id, function (err) {
          if (err)
            return next(new DBError(err), null);

          db.run(`VACUUM`, err => { // keep our tables nicely indexed
            if (err)
              return next(new DBError(err), null);

            next(null, { id: this.lastID, changes: this.changes });
          });
        });

      }
    });
  }

  getSentences(next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      db.all('SELECT sentence FROM corpus', (err, data) => {
        if (err)
          return next(new DBError(err), null);

        next(null, parse.sentences(data));
      });
    });
  }

  setSentences(sentences, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      db.run(`DELETE FROM corpus`, err => { // overwriting everything, so delete
        if (err)
          return next(new DBError(err), null);

        sentences = sanitize.sentences(sentences);

        var counter = 0;
        const callback = (err, data) => {
          if (err)
            return next(new DBError(err), null);

          counter++;
          if (counter === sentences.length)
            return next(null, {
              id: sentences.length,
              changes: sentences.length
            });
        };

        sentences.forEach(sentence => {
          db.run('INSERT INTO corpus (sentence) VALUES (?)', sentence, callback);
        });
      });
    });
  }

  getMeta(next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      db.get(`SELECT gui, labeler, owner, github_url, permissions, editors FROM meta`
        , (err, data) => {
          if (err)
            return next(new DBError(err), null);

          next(null, parse.meta(data));
        }
      );
    });
  }

  setMeta(params, next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      params = sanitize.meta(params);

      db.run(`
        UPDATE meta
        SET
          gui = IFNULL(?, gui),
          labeler = IFNULL(?, labeler),
          owner = IFNULL(?, owner),
          github_url = IFNULL(?, github_url),
          permissions = IFNULL(?, permissions),
          editors = IFNULL(?, editors)`
        , params.gui
        , params.labeler
        , params.owner
        , params.gihub_url
        , params.permissions
        , params.editors
        , function (err) {
          if (err)
            return next(new DBError(err), null);

          next(null, { id: this.lastID, changes: this.changes });
        }
      );
    });
  }

  load(next) {
    this.getMeta((err, meta) => {
      if (err)
        return next(new DBError(err), null);

      this.getSentences((err, sentences) => {
        if (err)
          return next(new DBError(err), null);

        next(null, { meta: meta, sentences: sentences });
      });
    });
  }

  save(state, next) {

    this.setMeta({
      gui: state.gui,
      menu: state.menu,
      labeler: state.labeler,
      current_index: state.index,
      owner: state.owner,
      github_url: state.github_url,
      permissions: state.permissions,
      editors: state.editors
    }, err => {
      if (err)
        return next(new DBError(err), null);

      this.setSentences(state.sentences, err => {
        if (err)
          return next(new DBError(err), null);

        next(null);
      });
    });
  }

}



module.exports = filename => new CorpusDB(filename);
