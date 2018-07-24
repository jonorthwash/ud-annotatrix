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

      db.get(`
        SELECT
          column_visibilities,
          format,
          is_table_view,
          input,
          nx
        FROM corpus WHERE rowid = (?)`, id, (err, data) => {
          if (err)
            return next(new DBError(err), null);

          next(null, parse(data));
        }
      );
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

            db.run(`
              UPDATE corpus
              SET
                column_visibilities= (?),
                format= (?),
                is_table_view= (?),
                input= (?),
                nx = (?)
              WHERE rowid = (?)`
              , sentence.column_visibilities
              , sentence.format
              , sentence.is_table_view
              , sentence.input
              , sentence.nx
              , id
              , function (err) {
                if (err)
                  return next(new DBError(err), null);

                next(null, { id: this.lastID, changes: this.changes });
              }
            );

          } else { // insert new

            db.run(`
              INSERT INTO corpus (
                column_visibilities,
                format,
                is_table_view,
                input,
                nx
              ) VALUES (?, ?, ?, ?, ?)`
              , sentence.column_visibilities
              , sentence.format
              , sentence.is_table_view
              , sentence.input
              , sentence.nx
              , function (err) {
                if (err)
                  return next(new DBError(err), null);

                if (isNaN(parseInt(this.lastID)))
                  return next(new DBError('Unable to insert'), null);

                next(null, { id: this.lastID, changes: this.changes });
              }
            );
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

      db.all(`
        SELECT
          column_visibilities,
          format,
          is_table_view,
          input,
          nx
        FROM corpus`, (err, data) => {
        if (err)
          return next(new DBError(err), null);

        next(null, data.map(sentence => parse(sentence)));
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

          //console.log('pre', sentence);
          sentence = sanitize.sentence(sentence);
          //console.log('post', sentence);
          //console.log();

          db.run(`
            INSERT INTO corpus (
              column_visibilities,
              format,
              is_table_view,
              input,
              nx
            ) VALUES (?, ?, ?, ?, ?)`
            , sentence.column_visibilities
            , sentence.format
            , sentence.is_table_view
            , sentence.input
            , sentence.nx
            , callback);
        });
      });
    });
  }

  getMeta(next) {
    open(this.path, (err, db) => {
      if (err)
        return next(new DBError(err), null);

      db.get(`
        SELECT
          current_index,
          owner,
          github_url,
          gui,
          labeler,
          permissions,
          editors
        FROM meta`, (err, data) => {
          if (err)
            return next(new DBError(err), null);

          next(null, parse(data));
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
          current_index = IFNULL(?, current_index),
          owner = IFNULL(?, owner),
          github_url = IFNULL(?, github_url),
          gui = IFNULL(?, gui),
          labeler = IFNULL(?, labeler),
          permissions = IFNULL(?, permissions),
          editors = IFNULL(?, editors)`
        , params.current_index
        , params.owner
        , params.github_url
        , params.gui
        , params.labeler
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

    this.setMeta(state.meta, err => {
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
