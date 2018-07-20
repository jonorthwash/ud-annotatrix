'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');
nx.Sentence.prototype.currentFormat = null;

const cfg = require('./config');
const funcs = require('./funcs');
const GUI = require('./gui');
const Graph = require('./graph');
const Labeler = require('./labels');
const errors = require('./errors');
const detectFormat = require('./detect');
const storage = require('./local-storage');
const convert = require('./convert');
const export_ = require('./export');
const status = require('./status');

class Manager {

  constructor() {

    funcs.global().manager = this;
    funcs.global().gui = new GUI();
    funcs.global().graph = new Graph();
    funcs.global().labeler = new Labeler();
    gui.bind();

    this.reset();
    this.load();

    this.export = export_;

    // save once every ? msecs
    setInterval(() => this.save(), cfg.saveInterval);
  }

  reset() {
    this.filename = cfg.defaultFilename;

    this._sentences = [];
    this._index = -1;

    this._filtered = [];
    this._filterIndex = null;

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
  updateFilter() {

    this._filtered = [];
    this._filterIndex = -1;
    this.map(i => {
      labeler._filter.forEach(name => {

        // ones that have this label
        if (labeler.has(i, name) && this._filtered.indexOf(i) === -1) {

          // save to array
          this._filtered.push(i);

          // keep counting up for the _filterIndex
          if (i <= this.index)
            this._filterIndex++;
        }
      });
    });

    if (this._filterIndex < 0)
      this._filterIndex = null;

    // if we filter out our current sentence
    if (this._filtered.length && this._filtered.indexOf(this._index) === -1)
      this.index = 0;

    return this;
  }
  get totalSentences() {
    return this._filtered.length
      ? `${this._filtered.length} (total: ${this.length})`
      : `${this.length}`;
  }
  get currentSentence() {
    return this.index + 1;
  }




  get index() {
    return this._index;
  }
  set index(index) {

    const total = this._filtered.length || this.length;

    index = parseInt(index);
    if (isNaN(index)) {
      log.warn(`Annotatrix: index out of range: ${index}`);
      index = this._filterIndex || this.index;

    } else if (index < 0 && total) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = 0;

    } else if (index > total - 1) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = total - 1;
    }

    if (this._filtered.length) {
      this._filterIndex = index;
      this._index = this._filtered[index];
    } else {
      this._filterIndex = null;
      this._index = index;
    }

    gui.update();
    return this.index;
  }
  first() {

    this.updateFilter();

    this.index = this.length ? 0 : -1;
    return this;
  }
  prev() {

    if (!this.length)
      return null;

    this.updateFilter();

    let index = this._filtered.length
      ? this._filterIndex
      : this._index;

    if (index === 0) {
      log.warn(`Annotatrix: already at the first sentence!`);
      return null;
    }

    this.index = --index;
    return this;
  }
  next() {

    if (!this.length)
      return null;

    this.updateFilter();

    let index = this._filtered.length
      ? this._filterIndex
      : this._index;
    let total = this._filtered.length
      ? this._filtered.length - 1
      : this._length - 1;

    if (index === total) {
      log.warn(`Annotatrix: already at the last sentence!`);
      return null;
    }

    this.index = ++index;
    return this;
  }
  last() {

    this.updateFilter();

    this.index = this._filtered.length
      ? this._filtered.length - 1
      : this.length - 1;
    return this;
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

    // set the first one at the current index
    this._sentences[this.index] = new nx.Sentence; // hack to get around updateSentence() behavior
    this.setSentence(this.index, splitted[0]);

    // iterate over all elements except the first
    _.each(splitted, (split, i) => {
      if (i) this.insertSentence(split);
    });

    gui.update();
    return this; // chaining
  }




  get format() {
    if (this.current)
      return this.current.currentFormat;
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
  get corpus() {
    const fileHeader = cfg.downloadHasFileHeader
      ? `# __ud_annotatrix_filename__ = "${this.filename}"
# __ud_annotatrix_timestamp__ = "${new Date()}"
# __ud_annotatrix_version__ = "${cfg.version}"
`
      : '';

    const sentences = this.map((i, sent) => {
      const sentenceHeader = cfg.downloadHasSentenceHeader
        ? `# __ud_annotatrix_id__ = "${i+1}"
# __ud_annotatrix_format__ = "${this.format}"
`
        : '';
      const content = this.format === 'Unknown'
        ? ''
        : this.sentence;

      return `${sentenceHeader}${content}`;
    }).join('\n\n');

    return `${fileHeader}${sentences}`;
  }



  save() {

    status.normal('saving...');

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
      gui: gui.state,
      labeler: labeler.state
    });

    storage.save(state)
    if (server && server.is_running)
      server.save(state);

    return state;
  }
  load(state) {

    state = state || (server && server.is_running
      ? server.load()
      : storage.load());

    if (!state) // unable to load
      return null;

    // parse it back from a string
    if (typeof state === 'string')
      state = JSON.parse(state);

    this.filename = state.filename;
    this._index = state.index;

    this._sentences = state.sentences.map(sent => {

      let sentence = nx.Sentence.fromNx(sent.nx);
      sentence.column_visibilities = sent.column_visibilities;
      sentence.currentFormat = sent.currentFormat;
      sentence.is_table_view = sent.is_table_view;
      sentence.nx_initialized = sent.nx_initialized;

      labeler.parse(sentence.comments);

      return sentence;

    });

    labeler.state = state.labeler;
    this.updateFilter(); // use the filters set in labeler

    // this triggers a gui refresh
    gui.state = state.gui;

    return state;
  }




  download() {
    funcs.download(`${this.filename}.corpus`, 'text/plain', this.corpus);
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

    text = convert.to.conllu(text);
    if (oldFormat === 'plain text') { // don't overwrite stuff :)
      sent = currentSent;
    } else {
      sent = nx.Sentence.fromConllu(text);
    }

  }

  sent.currentFormat = newFormat;
  sent.nx_initialized = oldSent.nx_initialized || false;
  sent.is_table_view = oldSent.is_table_view || false;
  sent.column_visibilities = oldSent.column_visibilities || new Array(10).fill(true);

  labeler.parse(sent.comments);

  return sent;
}

module.exports = Manager;
