'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');

const funcs = require('./funcs');
const GUI = require('./gui');
const Graph = require('./graph');

class Manager {

  constructor() {
    this.reset();
  }

  reset() {
    this._current = -1;
    this._filename = 'ud-annotatrix-corpus';
    this._sentences = [];

    this.gui = new GUI(this);
    this.graph = new Graph(this);

    this.insertSentence();
  }
  get length() {
    return this.sentences.length;
  }
  each(callback) {
    return this._sentences.map((sentence, i) => {
      return callback(i, sentence);
    });
  }

  get index() {
    return this._current;
  }
  set index(index) {

    index = parseInt(index);
    if (isNaN(index)) {
      log.warn(`Annotatrix: index out of range: ${index}`);
      index = this.index;

    } else if (index < 0) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = 0;

    } else if (index > this.length - 1) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = this.length - 1;
    }

    this._current = Math.floor(index); // enforce integer
    this.gui.update();

    return this.index;
  }
  first() {
    this.index = 0;
  }
  prev() {
    if (this.index === 0) {
      log.error(`Annotatrix: already at the first sentence!`);
      return null;
    }

    this.index--;
    return this.sentence;
  }
  next() {
    if (this.index === this.sentences.length - 1) {
      log.error(`Annotatrix: already at the last sentence!`);
      return null;
    }

    this.index++;
    return this.sentence;
  }
  last() {
    this.index = this.length - 1;
  }

  set filename(filename) {
    this._filename = filename;
    return this;
  }
  get filename() {
    return this._filename;
  }

  get current() {
    return this._sentences[this.index];
  }

  get sentence() {
    return this.current.text;
  }
  set sentence(text) {
    this.current = new Sentence(text);
    $('#text-data').val(this.sentence);

    return this.current.text;
  }
  get sentences() {
    return this.each((i, sent) => {
      return sent.text;
    });
  }
  setSentence(index, text) {

    // don't use this w/o an index param
    // instead, use .parse()

    this._sentences[index] = new Sentence(text);
    $('#text-data').val(this.sentence);

    return this._sentences[index].text;
  }
  getSentence(index) {
    index = index || 0;
    return this.sentences[index];
  }
  insertSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index;
      index = this.index;
    }

    const sent = new Sentence(text)
    this._sentences = this._sentences
        .slice(0, index + 1).concat(sent, this._sentences.slice(index + 1));
    this.index++;

    $('#text-data').val(this.sentence);
    $('#total-sentences').text(this.length);

    return sent.text;
  }
  removeSentence(index) {
    index = index === undefined ? this.index : index // default

    const removed = this._sentences.splice(index, 1);
    if (!this.length)
      this.insertSentence();

    this.index--;

    $('#text-data').val(this.sentence);
    $('#total-sentences').text(this.length);

    return removed;
  }

  split(text) {

    // split into sentences
    let splitted;
    if (detectFormat(text) === 'plain text') {
      // ( old regex: /[^ ].+?[.!?](?=( |$))/g )
      // match non-punctuation (optionally) followed by punctuation
      const matched = text.match(/[^.!?]+[.!?]*/g);
      log.debug(`parse(): match group: ${matched}`);
      splitted = matched === null
        ? [ text.trim() ]
        : matched.map((chunk) => {
          return chunk;
        });
    } else {
      splitted = text.split(/\n{2,}/g).map((chunk) => {
        return chunk.trim();
      });
    }

    // removing extra whitespace
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }
    return splitted.length ? splitted : [ '' ]; // need a default if empty

  }
  parse(text) {

    // if not passed explicitly, read from the textarea
    text = text || $('#text-data').val();
    let splitted = this.split(text);

    // overwrite contents of #text-data
    this.setSentence(this.index, splitted[0]);

    // iterate over all elements except the first
    $.each(splitted, (i, split) => {
      if (!i) return; // skip first
      this.insertSentence(split);
    });

    updateGui();
  }
  get lines() {
    return this.sentence.split('\n');
  }

  get format() {
    return this.current.format;
  }
  get formats() {
    return this.each((i, sent) => {
      return sent.format;
    });
  }

  get conllu() {
    return this.current.conllu;
  }
  set conllu(serial) {
    return this.current.conllu = convert2Conllu(serial);
  }
  get tokens() {
    if (!this.conllu.processed)
      this.conllu = this.sentence;
    return this.conllu.tokens;
  }
  iterTokens(callback) { // sugar
    if (!this.conllu.processed)
      this.conllu = this.sentence;
    return this.conllu.iterTokens(callback);
  }
  iterComments(callback) { // sugar
    if (!this.conllu.processed)
      this.conllu = this.sentence;
    return this.conllu.iterComments(callback);
  }

  get is_table_view() {
    return this.current._is_table_view;
  }
  set is_table_view(bool) {
    if (typeof bool === 'boolean')
      this.current._is_table_view = bool;

    return this.current._is_table_view;
  }

  column_visible(col, bool) {
    if (typeof bool === 'boolean')
      this.current._column_visibilities[col] = bool;

    return this.current._column_visibilities[col];
  }

  export() {
    return this.each((i, sent) => {
      return `[UD-Annotatrix: id="${i+1}" format="${sentence.format}"]
      ${sentence.text}`;
    }).join('\n\n');
  }
  encode() {
    return encodeURIComponent(this.export());
  }

}

module.exports = Manager;
