'use strict';

const _ = require('underscore');
const nx = require('notatrix');

const config = require('./config');


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
      ? nx.Corpus.deserialize(serial)
      : new nx.Corpus();
      
    this._corpus = _corpus;
    this._corpus._meta = _.defaults(_corpus._meta, {

      filename: config.default_filename,
      is_ltr: true,
      is_vertical: false,

    });

    if (this._corpus.length === 0)
      this.insertSentence(0, '');

    this.conversionLosses = [];
    this.conversionErrors = {};
  }

  get parsed() {
    return this.current ? this.current._meta.unparsed === null : false;
  }

  get length() {
    return this._corpus.length;
  }

  get index() {
    return this._corpus.index;
  }

  set index(index) {

    this.app.socket.broadcast({
      type: 'pan-sentences',
      index: this.index,
    });

    this._corpus.index = index;
    this.app.gui.refresh();
  }

  first() {
    this._corpus.first();
    this.app.gui.refresh();
  }

  prev() {
    this._corpus.prev();
    this.app.gui.refresh();
  }

  next() {
    this._corpus.next();
    this.app.gui.refresh();
  }

  last() {
    this._corpus.last();
    this.app.gui.refresh();
  }

  serialize() {
    return this._corpus.serialize();
  }

  getSentence(index) {
    return this._corpus.getSentence(index);
  }

  setSentence(index, text, broadcast=true) {

    let sent;

    try {

      sent = this._corpus.setSentence(index, text);

      // add some metadata
      sent._meta.format = detectFormat();
      sent._meta.unparsed = null;

      this.app.gui.status.normal('set-sentence');

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        // alert that we failed
        console.info(e.message);
        this.app.socket.broadcast({
          type: 'unsync-update',
          index: this.index,
          unparsed: serial,
        });
        this.app.gui.status.error('set-sentence');

        // make sure we know it's a dummy here
        sent._meta.format = null;
        sent._meta.unparsed = serial;

      } else {
        throw e;
      }
    }

    // alert success here & across the socket
    this.app.save(broadcast);
    this.app.gui.refresh();
    this.app.gui.status.normal('insert-sentence');
    if (broadcast)
      this.app.socket.broadcast({
        type: 'insert-sentence',
        index: this.index,
        sent: sent,
      });

    return sent;
  }

  insertSentence(index, text, broadcast=true) {

    let sent;

    try {

      sent = this._corpus.insertSentence(index, text);

      // add some metadata
      sent._meta.format = detectFormat();
      sent._meta.unparsed = null;

      this.app.gui.status.normal('insert-sentence');

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        // alert that we failed
        console.info(e.message);
        this.app.socket.broadcast({
          type: 'unsync-update',
          index: this.index,
          unparsed: serial,
        });
        this.app.gui.status.error('insert-sentence');

        // on parsing failure, add a dummy sentence
        sent = this.insertSentence(index, '', false);

        // make sure we know it's a dummy here
        sent._meta.format = null;
        sent._meta.unparsed = serial;

      } else {
        throw e;
      }
    }

    // alert success here & across the socket
    this.app.save(broadcast);
    if (this.app.initialized) {

      this.app.gui.refresh();
      if (broadcast)
        this.app.socket.broadcast({
          type: 'insert-sentence',
          index: this.index,
          sent: sent,
        });
    }

    return sent;
  }

  removeSentence(index, broadcast=true) {

    let sent;

    try {

      sent = this._corpus.removeSentence(index);
      this.app.gui.status.normal('remove-sentence');

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        console.info(e.message);
        this.app.gui.status.error('remove-sentence');

      } else {
        throw e;
      }
    }

    // alert success here & across the socket
    this.app.save(broadcast);
    this.app.gui.refresh();
    if (broadcast)
      this.app.socket.broadcast({
        type: 'remove-sentence',
        index: this.index,
        sent: sent,
      });

    return sent;
  }

  parse(text, broadcast=true) {

    let sent;

    try {

      const splitted = nx.split(text, this._corpus.options);
      const index = this.index || 0;

      splitted.forEach((split, i) => {

        if (i) {
          this.insertSentence(index + i, split);
        } else {
          this.setSentence(index, split);
        }

      });

    } catch (e) {

      if (e instanceof nx.NotatrixError) {

        console.info(e.message);
        this.app.gui.status.error('parse-sentence');

      } else {
        throw e;
      }
    }

    this.app.gui.refresh();
    this.app.save();
    return sent;
  }

  get textdata() {
    this.tryConvertAll();
    return this.convertTo(this.format);
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
    return this.current._meta.unparsed
      ? null
      : this.current._meta.format === 'notatrix serial'
        ? 'plain text'
        : this.current._meta.format;
  }

  get current() {
    return this.getSentence(this.index);
  }

  convertTo(format) {

    if (!this.current)
      return this.current._meta.unparsed;

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
        this.app.gui.status.error(`conversion-error-${format}`)
        this.current._meta.format = 'plain text';
        this.current._meta.unparsed = this.current._meta.unparsed || '';
        this.app.gui.refresh();

      } else {
        throw e;
      }
    }
  }

  tryConvertAll() {

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
