"use strict";

const _ = require("underscore");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid/v4");

const utils = require("../utils");
const NxError = utils.NxError;

const split = require("../splitter");
const detect = require("../detector");
const parse = require("../parser");
const generate = require("../generator");
const convert = require("../converter");

const NxBaseClass = require("./base-class");
const Labeler = require("./labeler");
const Sentence = require("./sentence");

/**
 * Abstraction over a collection of Sentences.  NOTE: this class is
 *  out-of-date and will be replaced soon :)
 */
class Corpus extends NxBaseClass {
  constructor(options) {
    super("Corpus");
    this.treebank_id = uuid();

    options = _.defaults(options, {
      requireOne: true,
    });
    this.filename = null;
    this.options = options;
    this.sources = [];

    this._labeler = new Labeler(this);
    this._sentences = [];
    this._index = -1;
    this._meta = {};
    this._filterIndex = -1;
  }

  get snapshot() {
    return {
      filename: this.filename,
      sentences: this.length,
      errors: this.errors.length,
      labels: this._labeler.sort(),
    };
  }

  get length() { return this._sentences.length; }

  get errors() {
    return this._sentences.filter(sent => {
      if (!sent.isParsed)
        return sent;
    });
  }

  get topLabels() { return this._labeler.top; }

  serialize() {
    return {
      filename: this.filename,
      meta: this._meta,
      options: this.options,
      labeler: this._labeler.serialize(),
      sentences: this._sentences.map(sent => sent.serialize(this.options)),
      index: this._index,
    };
  }

  static deserialize(serial) {
    const corpus = new Corpus(serial.options);
    corpus.filename = serial.filename || null;
    corpus._meta = serial.meta;
    corpus._labeler = Labeler.deserialize(corpus, serial.labeler);
    corpus._sentences = serial.sentences.map(s => {
      const sent = new Sentence(s, _.defaults(s.options, serial.options));
      sent._meta = s.meta;

      _.each(corpus._labeler._labels, (label, name) => {
        if (corpus._labeler.sentenceHasLabel(sent, name))
          label._sents.add(sent);
      });

      return sent;
    });
    corpus.index = serial.index;

    return corpus;
  }

  get sentence() { return this.index < 0 ? null : this._sentences[this.index]; }

  get filtered() {
    return this._labeler._filter.size
               ? this._sentences.filter(
                     sent => this._labeler.sentenceInFilter(sent))
               : [];
  }

  get index() { return this._index; }

  set index(index) {
    const filtered = this.filtered, total = filtered.length || this.length;

    index = parseInt(index);
    if (isNaN(index)) {
      index = filtered.length ? this._filterIndex : this.index;

    } else if (index < 0 && total) {
      index = 0;

    } else if (index > total - 1) {
      index = total - 1;
    }

    if (filtered.length) {
      this._filterIndex = index;
      this._index = filtered[index]._index;
    } else {
      this._filterIndex = -1;
      this._index = index;
    }

    return this.index;
  }

  reindex() {
    this._sentences.forEach((sent, i) => { sent._index = i; });
  }

  first() {
    this.index = this.length ? 0 : -1;
    return this;
  }
  prev() {
    if (!this.length)
      return null;

    const filtered = this.filtered;
    let index = filtered.length ? this._filterIndex : this._index;

    if (index === 0)
      return null;

    this.index = --index;
    return this;
  }
  next() {
    if (!this.length)
      return null;

    const filtered = this.filtered;
    let index = filtered.length ? this._filterIndex : this._index;
    let total = filtered.length ? filtered.length - 1 : this._length - 1;

    if (index === total)
      return null;

    this.index = ++index;
    return this;
  }
  last() {
    const filtered = this.filtered;
    this.index = filtered.length ? filtered.length - 1 : this.length - 1;

    return this;
  }

  getSentence(index) {
    if (index == undefined)
      index = this.index;

    if (0 > index || index > this.length - 1)
      return null;

    return this._sentences[index] || null;
  }

  setSentence(index, text) {
    if (text === null || text === undefined) { // if only passed 1 arg
      text = index || "";
      index = this.index;
    }

    index = parseInt(index)
    if (isNaN(index) || this.getSentence(index) === null)
    throw new NxError(`cannot set sentence at index ${index}`);

    this._labeler.onRemove(this.getSentence(index));
    const sent = new Sentence(text, this.options);
    sent.corpus = this;

    this._sentences[index] = sent;
    this._labeler.onAdd(sent);
    this.reindex();

    return sent;
  }

  insertSentence(index, text) {
    if (text === null || text === undefined) { // if only passed 1 arg
      text = index || "";
      index = this.index + 1;
    }

    index = parseFloat(index);
    if (isNaN(index))
      throw new NxError(`cannot insert sentence at index ${index}`);

    index = index < 0 ? 0 : index > this.length ? this.length : parseInt(index);

    const sent = new Sentence(text, this.options);
    sent.corpus = this;

    this._sentences = this._sentences.slice(0, index).concat(sent).concat(
        this._sentences.slice(index));
    this._labeler.onAdd(sent);

    this.index = index;
    this.reindex();
    return sent;
  }

  removeSentence(index) {
    if (!this.length)
      return null;

    if (index === undefined) // if not passed args
      index = this.index;

    index = parseFloat(index);
    if (isNaN(index))
      throw new NxError(`cannot remove sentence at index ${index}`);

    index = index < 0
                ? 0
                : index > this.length - 1 ? this.length - 1 : parseInt(index);

    const removed = this._sentences.splice(index, 1)[0];
    if (!this.length)
      this.insertSentence();

    this._labeler.onRemove(removed);

    if (index <= this.index)
      this.index--;
    this.reindex();
    return removed;
  }

  pushSentence(text) { return this.insertSentence(Infinity, text); }

  popSentence(text) { return this.removeSentence(Infinity); }

  parse(string) {
    const splitted = split(string, this.options); // might throw errors
    const index = this.index || 0;
    console.log('parse() ' + index);

    splitted.forEach((split, i) => {
      // console.log(i, split);
      //this.insertSentence(index + i, split, false);
      this.pushSentence(split);
      console.log('pushSentence() ' + i); 
    });

    return this;
  }

  static fromString(string, options) {
    const corpus = new Corpus(options);
    corpus.parse(string);
    corpus.index = 0;
    return corpus;
  }

  readFile(filepath, next) {
    fs.exists(filepath, exists => {
      if (!exists)
        throw new NxError(`cannot read file: cannot find path ${filepath}`);

      fs.readFile(filepath, (err, data) => {
        if (err)
          throw err;

        data = data.toString();
        this.parse(data);
        this.sources.push(filepath);
        this.filename = path.basename(filepath);

        if (next)
          next(this);
      });
    });
  }

  static fromFile(filepath, options, next) {
    if (next === undefined) {
      next = options;
      options = {};
    }
    const corpus = new Corpus(options);
    corpus.readFile(filepath, next);

    return this;
  }

  writeFile(format, filepath) {
    filepath = this.getWritePath(filepath);

    const contents = this.serialize();
    fs.writeFile(filepath, contents, err => {
      if (err)
        throw err;
    });

    return this;
  }

  getWritePath(filepath) {
    if (filepath)
      return filepath;

    const lastSource = this.sources.slice(-1)[0];
    return (lastSource || "export") + ".nxcorpus";
  }
}

module.exports = Corpus;
