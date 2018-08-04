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
const storage = require('./local-storage');
const export_ = require('./export');
const status = require('./status');
const Sentence = require('./sentence');
const Socket = require('./socket');

class Manager {

  constructor() {

    funcs.global().manager = this;
    funcs.global().gui = new GUI();
    funcs.global().graph = new Graph();
    funcs.global().labeler = new Labeler();
    if (gui.inBrowser)
      this.socket = Socket(this);
    gui.bind();

    this.reset();
    this.load();

    this.export = export_;
  }

  reset() {
    this.filename = cfg.defaultFilename;
    this.options = {};

    this._sentences = [];
    this._index = -1;

    this._filtered = [];
    this._filterIndex = null;
    this.insertSentence();
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
    this.emit('pan', { index: this.index });
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
    this.onChange();

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

    this.emit('update', {
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

    this.emit('update', {
      type: 'remove',
      index: index,
      format: removed.format,
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



  onChange() {
    /*

    this.emit('update', {
      type: 'modify',
      index: index,
      format: sent.format,
      nx: sent.nx
    });
    gui.update();
    */
    if (!this.current.parsed)
      return;

    this.save();
    gui.update();
  }
  parse(text, options={}) {

    const index = options.index || this.index;
    const splitted = nx.split(text, options);//.map(transform);

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
      index: this._index,
      labeler: labeler.state,
      options: this.options,
      sentences: this._sentences.map(sent => sent.state),
      meta: {
        pinned_menu_items: gui.menu.state,
        is_textarea_visible: gui.is_textarea_visible,
        is_label_bar_visible: gui.is_label_bar_visible,
        filename: this.filename,
      },
    };
  }

  set state(state) {

    console.info('LOADING STATE', state);

    this.options = state.options;
    this._sentences = state.sentences.map((state, i) => {

      console.log('loading', i)
      const sent = new Sentence();
      sent.state = state;
      return sent;

    });
    this._index = state.index;

    if (!this.current)
      this.insertSentence(cfg.defaultSentence);

    // update users stuff
    //this.users.state = _.pick(state.meta, ['owner', 'github_url', 'permissions', 'editors']);

    labeler.state = state.labeler;
    this.updateFilter(); // use the filters set in labeler

    gui.menu.state = state.meta.pinned_menu_items;
    gui.is_textarea_visible = state.meta.is_textarea_visible;
    gui.is_label_bar_visible = state.meta.is_label_bar_visible;
    this.filename = state.meta.filename;

    gui.update();
  }

  save() {

    status.normal('saving...');

    if (!manager.current || !manager.current.parsed) {
      status.error('Unable to save: no current parsed sentence')
      return;
    }

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
  emit(eventName, data) {
    //console.log('try emitting', eventName, data)
    if (this.socket && this.socket.initialized && this.socket.isOpen)
      this.socket.emit(eventName, data);
  }



  download() {
    funcs.download(`${this.filename}.corpus`, 'text/plain', this.corpus);
  }
}


module.exports = Manager;
