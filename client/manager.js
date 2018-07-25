'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');

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
const Sentence = require('./sentence');
const Users = require('./users');
const Socket = require('./socket');

class Manager {

  constructor() {

    funcs.global().manager = this;
    funcs.global().gui = new GUI();
    funcs.global().graph = new Graph();
    funcs.global().labeler = new Labeler();
    if (gui.inBrowser)
      this.socket = Socket(this);
    this.users = new Users();
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
    if (sent instanceof Sentence)
      this._sentences[this.index] = sent;
  }
  toString() {
    return this.current ? this.current.toString() : null;
  }

  set sentence(text) {
    return this.setSentence(text);
  }
  setSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index || '';
      index = this.index;
    }

    if (0 > index || index > this.length - 1)
      return null;

    this._sentences[index].update(text);

    const sent = this._sentences[index];
    this.emit({
      type: 'modify',
      index: index,
      format: sent.format,
      nx: sent.nx
    });
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

    const sent = new Sentence(text);
    this._sentences = this._sentences.slice(0, index)
      .concat(sent)
      .concat(this._sentences.slice(index));

    this.emit({
      type: 'insert',
      index: index,
      format: sent.format,
      nx: sent.nx
    });

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

    this.emit({
      type: 'remove',
      index: index,
      format: sent.format,
      nx: null
    });
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
  parse(text, options={}) {

    const transform = options.transform || funcs.noop;
    const index = options.index || this.index;

    let splitted = this.split(text).map(transform);

    // set the first one at the current index
    this.setSentence(index, splitted[0]);

    // iterate over all elements except the first
    _.each(splitted, (split, i) => {
      if (i)
        this.insertSentence(index + i, split);
    });

    gui.update();
    return this; // chaining
  }



  get format() {
    if (this.current)
      return this.current.format;
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


  get state() {
    return {
      meta: {
        current_index: this.index,
        owner: this.users.owner,
        github_url: this.users.github_url,
        gui: gui.state,
        labeler: labeler.state,
        permissions: this.users.permissions,
        editors: this.users.editors
      },
      sentences: this.map((i, sent) => sent.state)
    };
  }

  set state(state) {

    console.info('LOADING STATE', state);
    this._index = state.meta.current_index;
    this._sentences = state.sentences.map(state => {

      let sent = new Sentence();
      sent.state = state;
      return sent;

    });
    if (!this.current)
      this.insertSentence(cfg.defaultSentence);

    // update users stuff
    this.users.state = _.pick(state.meta, ['owner', 'github_url', 'permissions', 'editors']);

    labeler.state = state.meta.labeler;
    this.updateFilter(); // use the filters set in labeler

    // this triggers a gui refresh
    gui.state = state.meta.gui;

  }

  save() {

    status.normal('saving...');

    const state = JSON.stringify(this.state);

    storage.save(state);
    if (server && server.is_running)
      server.save(state);

    return state;
  }
  load(state) {

    state = state || (server && server.is_running
      ? server.load()
      : storage.load());

    if (!state) { // unable to load
      if (!this.current)
        this.insertSentence(cfg.defaultSentence);

      return null;
    }

    // parse it back from a string
    if (typeof state === 'string')
      state = JSON.parse(state);

    this.state = state;

    return state;
  }
  emit(data) {
    if (this.socket && this.socket.initialized && this.socket.open)
      this.socket.emit('update', data);
  }



  download() {
    funcs.download(`${this.filename}.corpus`, 'text/plain', this.corpus);
  }
}


module.exports = Manager;
