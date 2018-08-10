'use strict';

const _ = require('underscore');
const nx = require('notatrix');

const config = require('./config');
const utils = require('../utils');


function detectFormat(serial) {

  let formats = [ 'plain text' ];
  if (serial)
    formats = nx.detect(serial);

  // check if we found nothing
  if (formats.length === 0)
    throw new nx.NotatrixError('Unable to interpret input');

  // or found something lossless
  if (formats.indexOf('notatrix serial') > -1)
    return 'notatrix serial';

  // or found just one thing
  if (formats.length === 1)
    return formats[0];

  // or found one of the formats we like
  config.format_preferences.forEach(pref => {

    if (formats.indexOf(pref) > -1)
      return pref;

  });

  // just take whatever's left
  return formats[0];
}



class Corpus {
  constructor(app, serial='') {

    this.app = app;
    this.config = config;

    const _corpus = serial
      ? nx.Corpus.deserialize(serial, { allowZeroTokens: true })
      : new nx.Corpus();

    this._corpus = _corpus;
    this._corpus._meta = _.defaults(_corpus._meta, {

      filename: config.default_filename,
      is_ltr: true,
      is_vertical: false,

    });

    this._corpus._sentences.forEach(sent => {

      // add some metadata
      sent._meta.format = detectFormat(sent.input);
      sent._meta.unparsed = null;

    });

    if (this._corpus.length === 0)
      this.insertSentence(0, '', false);

    this.conversionLosses = [];
    this.conversionErrors = {};

    this.app.undoer.current = this.serialize();

    setTimeout(() => {
      if (this.app.initialized)
        this.app.socket.broadcast('modify index', this.index);
    }, 500);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);
  }

  get parsed() {
    return this.current ? this.current._meta.unparsed === null : false;
  }

  set parsed(text) {
    throw new Error();
  }

  get length() {
    return this._corpus.length;
  }

  get index() {
    return this._corpus.index;
  }

  set index(index) {

    this._corpus.index = index;
    this.app.gui.refresh();

    if (this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);
  }

  first() {
    this._corpus.first();
    this.app.gui.refresh();

    if (this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);
  }

  prev() {
    this._corpus.prev();
    this.app.gui.refresh();

    if (this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);
  }

  next() {
    this._corpus.next();
    this.app.gui.refresh();

    if (this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);
  }

  last() {
    this._corpus.last();
    this.app.gui.refresh();

    if (this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);
  }

  serialize() {
    return this._corpus.serialize();
  }

  getSentence(index) {
    return this._corpus.getSentence(index);
  }

  setSentence(index, text, main=true) {

    let sent;

    try {

      sent = this._corpus.setSentence(index, text);

      // add some metadata
      sent._meta.format = detectFormat(text);
      sent._meta.unparsed = null;

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        // alert that we failed
        console.info(e.message);
        this.app.socket.unlink(index);
        this.app.gui.status.error(`Unable to set sentence ${index + 1}`);

        // set dummy sentence
        sent = this._corpus.setSentence(index, '');

        // make sure we know it's a dummy here
        sent._meta.format = null;
        sent._meta.unparsed = text;

      } else {
        throw e;
      }
    }

    if (main)
      this.app.save({
        type: 'set',
        indices: [index || this.index],
      });

    if (main && this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    return sent;
  }

  insertSentence(index, text, main=true) {

    let sent;

    try {

      sent = this._corpus.insertSentence(index, text);

      // add some metadata
      sent._meta.format = detectFormat(text);
      sent._meta.unparsed = null;

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        // alert that we failed
        console.info(e.message);
        this.app.socket.unlink(index);
        this.app.gui.status.error(`Unable to insert sentence ${index + 1}`);

        // on parsing failure, add a dummy sentence
        sent = this.insertSentence(index, '', false);

        // make sure we know it's a dummy here
        sent._meta.format = null;
        sent._meta.unparsed = serial;

      } else {
        throw e;
      }
    }

    if (main)
      this.app.save({
        type: 'insert',
        indices: [index || this.index],
      });

    if (main && this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);

    return sent;
  }

  removeSentence(index, main=true) {

    let sent;

    try {

      sent = this._corpus.removeSentence(index);

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        console.info(e.message);
        this.app.gui.status.error(`Unable to remove sentence ${index + 1}`);

      } else {
        throw e;
      }
    }

    if (main)
      this.app.save({
        type: 'remove',
        indices: [index || this.index],
      });

    if (main && this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);

    return sent;
  }

  parse(text, main=true) {

    let sents = [];

    try {

      const splitted = nx.split(text, this._corpus.options);
      const index = this.index || 0;

      splitted.forEach((split, i) => {

        if (i) {
          this.insertSentence(index + i, split, false);
        } else {
          this.setSentence(index, split, false);
        }

        sents.push(index + i);

      });

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        console.info(e.message);
        this.app.gui.status.error(`Unable to parse input`);

      } else {
        throw e;
      }
    }

    if (main)
      this.app.save({
        type: 'parse',
        indices: sents,
      });

    if (main && this.app.initialized)
      this.app.socket.broadcast('modify index', this.index);

    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1); }, 100);

    return sents;
  }

  get textdata() {
    this.tryConvertAll();
    return this.unparsed || this.convertTo(this.format);
  }

  getIndices() {
    const filtered = this._corpus.filtered;

    return {
      current: this._corpus.index + 1,
      total: filtered.length
        ? `${filtered.length} (total: ${this.length})`
        : `${this.length}`,
    };
  }

  get format() {
    return this.current._meta.unparsed === null
      ? this.current._meta.format === 'notatrix serial'
        ? 'plain text'
        : this.current._meta.format
      : null;
  }

  set format(format) {
    this.current._meta.format = format;
  }

  get is_ltr() {
    return this._corpus._meta.is_ltr;
  }

  set is_ltr(bool) {
    this._corpus._meta.is_ltr = bool;
  }

  get is_vertical() {
    return this._corpus._meta.is_vertical;
  }

  set is_vertical(bool) {
    this._corpus._meta.is_vertical = bool;
  }

  get is_enhanced() {
    return this.current.options.enhanced;
  }

  get filename() {
    return this._corpus._meta.filename;
  }

  set filename(filename) {
    this._corpus._meta.filename = filename;
  }

  get unparsed() {
    return this.current._meta.unparsed;
  }

  set unparsed(text) {
    this.format = null;
    this.current._meta.unparsed = text;
  }

  get current() {
    return this.getSentence(this.index);
  }

  convertTo(format) {

    try {

      if (!format) {
        format = 'plain text';
        this.current._meta.format = 'plain text';
        this.current._meta.unparsed = this.current._meta.unparsed || '';
      }

      const converted = this.current.to(format);

      this.conversionLosses = converted.loss;
      return converted.output;

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        console.info(e);
        this.app.gui.status.error(`Error converting to format ${format}`)
        this.current._meta.format = 'plain text';
        this.current._meta.unparsed = this.current._meta.unparsed || '';
        this.app.gui.refresh();

      } else {
        throw e;
      }
    }
  }

  tryConvertAll() {

    this.conversionErrors = {};
    ['Brackets', 'CG3', 'CoNLL-U', 'plain text', 'SD'].forEach(format => {
      try {

        this.current.to(format);

      } catch (e) {

        this.conversionErrors[format] = e.message;

      }
    });
  }

  /*
  editSentence(index, serial) {

    let sent;

    try {

      if (this.getSentence(index)._meta.unparsed)
        throw new Error(); // fail on purpose

      sent = this.getSentence(index).update(serial, this._corpus.options);

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        this.removeSentence(this.index, false);
        sent = this.insertSentence(this.index, serial, false);

      } else {
        throw e;
      }

    }

    this.app.save(false);
    this.app.gui.status.normal('update-sentence');
    if (broadcast)
      this.app.socket.broadcast({
        type: 'update-sentence',
        index: this.index,
        sent: sent,
      });

    return sent;
  }
  */
}


module.exports = Corpus;
