'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');
nx.Sentence.prototype.currentFormat = null;

const cfg = require('./config');
const funcs = require('./funcs');
const GUI = require('./gui');
const Graph = require('./graph');
const errors = require('./errors');
const detectFormat = require('./detect');
const storage = require('./local-storage');

class Manager {

  constructor() {

    funcs.global().manager = this;
    funcs.global().gui = new GUI();
    funcs.global().graph = new Graph();
    gui.bind();

    this.reset();
    this.load();

    // save once per second
    setInterval(() => this.save(), 1000);
  }

  reset() {
    this.filename = cfg.defaultFilename;

    this._sentences = [];
    this._index = -1;

    this.insertSentence(cfg.defaultSentence);
  }
  get length() {
    return this._sentences.length;
  }
  map(callback) {
    return this._sentences.map((sentence, i) => {
      return callback(i, sentence);
    });
  }





  get index() {
    return this._index;
  }
  set index(index) {

    index = parseInt(index);
    if (isNaN(index)) {
      log.warn(`Annotatrix: index out of range: ${index}`);
      index = this.index;

    } else if (index < 0 && this.length) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = 0;

    } else if (index > this.length - 1) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = this.length - 1;
    }

    this._index = Math.floor(index); // enforce integer
    gui.update();
    return this.index;
  }
  first() {
    this.index = this.length ? 0 : -1;
  }
  prev() {
    if (!this.length)
      return null;

    if (this.index === 0) {
      log.warn(`Annotatrix: already at the first sentence!`);
      return null;
    }

    this.index--;
    return this.sentence;
  }
  next() {
    if (this.index === this._sentences.length - 1) {
      log.warn(`Annotatrix: already at the last sentence!`);
      return null;
    }

    this.index++;
    return this.sentence;
  }
  last() {
    this.index = this.length - 1;
  }




  get current() {
    return this._sentences[this.index];
  }
  set current(sent) {
    if (sent instanceof nx.Sentence)
      this._sentences[this.index] = sent;
  }
  get sentence() {
    if (!this.current)
      return null;

    if (this.format === 'CoNLL-U') {
      return this.current.conllu;
    } else if (this.format === 'CG3') {
      return this.current.cg3;
    } else {
      return this.current.text;
    }
  }
  set sentence(text) {
    return this.setSentence(text);
  }
  get sentences() {
    return this.map((i, sent) => {
      return sent.text;
    });
  }
  setSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index || '';
      index = this.index;
    }

    if (0 > index || index > this.length - 1)
      return null;

    this._sentences[index] = updateSentence(this._sentences[index], text);
    gui.update();

    return this.getSentence(index);
  }
  getSentence(index) {

    if (index === undefined)
      index = this.index;

    if (0 > index || index > this.length - 1)
      return null;

    return this._sentences[index];
  }
  insertSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index || cfg.defaultInsertedSentence;
      index = this.index + 1;
    }

    index = parseFloat(index);
    if (isNaN(index))
      throw new errors.AnnotatrixError('cannot insert at NaN');

    index = index < 0 ? 0
      : index > this.length ? this.length
      : parseInt(index);

    const sent = updateSentence({}, text);
    this._sentences = this._sentences.slice(0, index)
      .concat(sent)
      .concat(this._sentences.slice(index));

    this.index = index;
    gui.update();

    return sent.text;
  }
  removeSentence(index) {

    if (!this.length)
      return null;

    if (index === undefined) // if not passed args
      index = this.index;

    index = parseFloat(index);
    if (isNaN(index))
      throw new errors.AnnotatrixError('cannot insert at NaN');

    index = index < 0 ? 0
      : index > this.length - 1 ? this.length - 1
      : parseInt(index);

    const removed = this._sentences.splice(index, 1)[0];
    if (!this.length)
      this.insertSentence();
    this.index--;

    gui.update();

    return removed;
  }
  pushSentence(text) {
    return this.insertSentence(Infinity, text);
  }
  popSentence(text) {
    return this.removeSentence(Infinity);
  }





  split(text) {

    // split into sentences
    let splitted;
    if (detectFormat(text) === 'plain text') {

      // match non-punctuation (optionally) followed by punctuation
      const matched = text.match(/[^.!?]+[.!?]*/g);
      log.debug(`parse(): match group: ${matched}`);
      splitted = matched === null
        ? [ text.trim() ]
        : matched;

    } else {

      // match between multiple newlines
      splitted = text.split(/\n{2,}/g).map(chunk => {
        return chunk.trim();
      });
    }

    // removing extra whitespace in reverseorder
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }
    return splitted.length ? splitted : [ '' ]; // need a default if empty

  }
  parse(text) {

    // if not passed explicitly, read from the textarea
    text = text || gui.read('text-data');
    let splitted = this.split(text);

    // overwrite contents of #text-data
    this.sentence = splitted[0];

    // iterate over all elements except the first
    _.each(splitted, (split, i) => {
      if (!i) return; // skip first
      this.insertSentence(split);
    });

    gui.update();
  }




  get format() {
    if (this.current)
      return this.current.currentFormat;
  }
  get comments() {
    if (this.current)
      return this.current.comments;
  }
  get tokens() {
    if (this.current)
      return this.current.tokens;
  }
  get conllu() {
    if (this.current)
      return this.current.conllu;
  }
  get cg3() {
    if (this.current)
      return this.current.cg3;
  }
  get graphable() {
    return this.format === 'CoNLL-U' || this.format === 'CG3';
  }




  save() {

    const state = JSON.stringify({
      filename: this.filename,
      index: this._index,
      sentences: this.map((i, sent) => {
        return {
          nx: sent.nx,
          column_visibilities: sent.column_visibilities,
          currentFormat: sent.currentFormat,
          is_table_view: sent.is_table_view,
          nx_initialized: sent.nx_initialized
        };
      }),
      gui: gui.state
    });

    if (server && server.is_running) {
      server.save(state);
    } else {
      storage.save(state);
    }

    return state;
  }
  load() {

    let state = (server && server.is_running)
      ? server.load()
      : storage.load();

    if (!state) // unable to load
      return null;

    // parse it back from a string
    state = JSON.parse(state);

    this.filename = state.filename;
    this._index = state.index;

    this._sentences = state.sentences.map(sent => {

      let sentence = nx.Sentence.fromNx(sent.nx);
      sentence.column_visibilities = sent.column_visibilities;
      sentence.currentFormat = sent.currentFormat;
      sentence.is_table_view = sent.is_table_view;
      sentence.nx_initialized = sent.nx_initialized;
      return sentence;

    });

    // this triggers a gui refresh
    gui.state = state.gui;

    return state;
  }




  upload() {
    return this.save();
  }
  export() {

    if (!gui.inBrowser)
      return null;

    // export corpora to file
    if (server.is_running) {
      server.download();
    } else {

      const link = $('<a>')
        .attr('download', this.filename)
        .attr('href', `data:text/plain; charset=utf-8,${this.encode()}`);
      $('body').append(link);
      link[0].click();

    }
  }
  encode() {
    return encodeURIComponent(this.map((i, sent) => {
      return `[UD-Annotatrix: id="${i+1}" format="${this.format}"]
      ${ (this.format === 'Unknown') ? '' : this.sentence }`;
    }).join('\n\n'));
  }
  print() {
    throw new Error('print() not implemented');
  }

}

function updateSentence(oldSent, text) {

  const currentSent = manager.current,
    oldFormat = manager.format,
    newFormat = detectFormat(text);

  let sent;

  if (newFormat === 'CoNLL-U') {

    if (oldFormat === 'plain text') { // don't overwrite stuff :)
      sent = currentSent;
    } else {
      sent = nx.Sentence.fromConllu(text);
    }

  } else if (newFormat === 'CG3') {

    if (oldFormat === 'plain text') { // don't overwrite stuff :)
      sent = currentSent;
    } else {
      sent = nx.Sentence.fromCG3(text);
    }

  } else if (newFormat === 'plain text') {

    if (oldSent.nx_initialized) { // don't overwrite stuff :)
      sent = oldSent;
    } else {
      sent = nx.Sentence.fromText(text);
    }

  } else if (newFormat === 'Unknown') {

    sent = nx.Sentence.fromText('');

  } else {
    throw new Error(`format not yet supported: ${newFormat}`)
  }

  sent.currentFormat = newFormat;
  sent.nx_initialized = oldSent.nx_initialized || false;
  sent.is_table_view = oldSent.is_table_view || false;
  sent.column_visibilities = oldSent.column_visibilities || new Array(10).fill(true);

  return sent;
}

module.exports = Manager;
