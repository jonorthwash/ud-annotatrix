'use strict';

const _ = require('underscore');
const nx = require('notatrix');
const utils = require('./utils');

// for when we're editing a corpus that isn't from /upload
const default_filename = 'ud-annotatrix-corpus';

// use these formats in order in case of ambiguity (rare)
const format_preferences = [
  'CoNLL-U',
  'CG3',
  'SD',
  'plain text',
  'Brackets',
];

/**
 * Helper function for Corpus.  Attempts to detect the format of a given serial
 *  string/object.  If it can't detect one, it returns null.  If it detects one
 *  or more, it follows a simple resolution algorithm to pick one.
 *
 * @param {(String|Object)} serial
 * @return {(String|null)} the string name of the detected format
 */
function detectFormat(serial) {

  // do the detecting under the hood
  let formats = serial
    ? nx.detect(serial)
    : [ 'plain text' ];

  // check if we found nothing
  if (formats.length === 0)
    return null;

  // or found something lossless
  if (formats.indexOf('notatrix serial') > -1)
    return 'notatrix serial';

  // or found just one thing
  if (formats.length === 1)
    return formats[0];

  // or found one of the formats we like
  format_preferences.forEach(pref => {

    if (formats.indexOf(pref) > -1)
      return pref;
  });

  // just take whatever's left (safety valve, hopefully never hit this case)
  return formats[0];
}


/**
 * Abstraction over the nx.Corpus to handle some extra metadata (filename, text
 *  direction, filename) and interfacing with our other modules.
 *
 * @param {App} app a reference to the parent of this module
 * @param {(String|Object)} serial a serial representation of an nx.Corpus in any format
 */
class Corpus {
  constructor(app, serial='') {

    // save a reference to the parent
    this.app = app;

    // get the nx.Corpus data structure (with some corpus-wide metadata)
    this._corpus = serial
      ? nx.Corpus.deserialize(serial)
      : new nx.Corpus();
    this._corpus._meta = _.defaults(this._corpus._meta, {

      filename: default_filename,
      is_ltr: true,
      is_vertical: false,

    });

    // add some metadata
    this._corpus._sentences.forEach((sent, i) => {
      sent._meta.format = detectFormat(sent.input);
    });

    // make sure we always have at least one sentence
    if (this._corpus.length === 0)
      this.insertSentence(0, '', false);

    // keep undo stack up to date
    this.app.undoer.current = this.serialize();

    // update hash
    this.afterModifyIndex();
  }


  // ---------------------------------------------------------------------------
  // Getters & Setters for corpus- and sentence-wide metadata

  /**
   * Get the format of the current sentence.  If the sentence is not fully parsed,
   *  then we return null.
   *
   * NB: this will never return 'notatrix serial' as the format, even if this was
   *  most recent serial string given (because we never want the user to see this
   *  format, which is what we send over the wire).
   *
   * @return {(String|null)}
   */
  get format() {

    // if not parsed, format is always null
    return this.isParsed
      ? this.current._meta.format === 'notatrix serial'
        ? 'plain text'
        : this.current._meta.format
      : null;
  }

  /**
   * Set the format of the current sentence (internal, not sanitized).
   *
   * @param {String} format
   */
  set format(format) {
    this.current._meta.format = format;
  }

  /**
   * Get whether the corpus orientation is Left-to-Right (important for the Graph).
   *
   * @return {Boolean}
   */
  get is_ltr() {
    return this._corpus._meta.is_ltr;
  }

  /**
   * Set whether the corpus orientation is Left-to-Right (important for the Graph).
   *
   * @param {Boolean} bool
   */
  set is_ltr(bool) {
    this._corpus._meta.is_ltr = bool;
  }

  /**
   * Get whether the corpus orientation is Top-to-Bottom (important for the Graph).
   *
   * @return {Boolean}
   */
  get is_vertical() {
    return this._corpus._meta.is_vertical;
  }

  /**
   * Set whether the corpus orientation is Top-to-Bottom (important for the Graph).
   *
   * @param {Boolean} bool
   */
  set is_vertical(bool) {
    this._corpus._meta.is_vertical = bool;
  }

  /**
   * Get whether the corpus is in 'enhanced' mode (i.e. should display and allow
   *  us to add multiple heads for each token).
   *
   * @return {Boolean}
   */
  get is_enhanced() {
    return this.current.options.enhanced;
  }

  /**
   * Get the filename associated with the corpus.
   *
   * @return {String}
   */
  get filename() {
    return this._corpus._meta.filename;
  }

  /**
   * Set the filename associated with the corpus.
   *
   * @param {String} filename
   */
  set filename(filename) {
    this._corpus._meta.filename = filename;
  }



  // ---------------------------------------------------------------------------
  // Helper functions for the GUI sentence navigation

  /**
   * Returns the string that we should set as the val() of #text-data
   *
   * @return {String}
   */
  get textdata() {

    return this.isParsed
      ? this.convertTo(this.format)
      : this.current.input
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t');
  }

  /**
   * Returns the two values that we should set to tell the user what our current
   *  index is. (current -> #current-sentence, total -> #total-sentences).
   *
   * @return {Object} { current: Number, total: String }
   */
  getIndices() {

    // the label filter
    const filtered = this._corpus.filtered;

    return {
      current: this.index + 1,
      total: filtered.length
        ? `${filtered.length} (total: ${this.length})`
        : `${this.length}`,
    };
  }



  // ---------------------------------------------------------------------------
  // General helper functions

  /**
   * Get a serial representation of the nx.Corpus (useful for saving/sending
   *  over the wire).
   *
   * @return {Object}
   */
  serialize() {
    return this._corpus.serialize();
  }

  /**
   * Checks whether the current sentence is parsed
   *
   * @return {Boolean}
   */
  get isParsed() {
    return this.current ? this.current.isParsed : false;
  }

  /**
   * Returns the unparsed content of the current sentence
   *
   * @return {(String|null)}
   */
  get unparsed() {
    return this.isParsed
      ? null
      : this.current.input;
  }

  /**
   * Get a representation of the current sentence in <format>, ignoring lossiness.
   *  NB: this function *should* not throw errors because we already check if a
   *  given conversion will throw errors (in `gui/textarea.js::refresh`)
   *
   * @param {String} format
   * @return {String}
   */
  convertTo(format) {
    return this.current.to(format).output;
  }

  /**
   * Helper function to handle broadcasting index modifications and hash updates.
   *  NB: internal only.
   */
  afterModifyIndex() {

    // possibly update the view and send something over the wire
    if (this.app.initialized) {
      this.app.gui.refresh();
      this.app.socket.broadcast('modify index', this.index);
    }

    // update the fragment identifier (the stuff after '#' in the url)
    if (utils.check_if_browser())
      setTimeout(() => {
        window.location.hash = (this.index + 1);
      }, 1000);
  }



  // ---------------------------------------------------------------------------
  // Wrappers for nx.Corpus methods

  /**
   * Returns the number of sentences in the corpus
   *
   * @return {Number}
   */
  get length() {
    return this._corpus.length;
  }

  /**
   * Returns the currently-focused sentence.  This is useful if another method
   *  wants to access the internals of the nx.Sentence at this.index.  If there
   *  are no sentences, it returns null.
   *
   * @return {(nx.Sentence)|null}
   */
  get current() {
    return this.getSentence(this.index);
  }

  /**
   * Returns the index of the current sentence in the nx.Corpus.  If there are
   *  no sentences, it returns null.
   *
   * @return {(Number|null)}
   */
  get index() {
    return this._corpus.index;
  }

  /**
   * Modify the current index to <index>.
   *
   * @param {Number} index
   */
  set index(index) {
    this._corpus.index = index;
    this.afterModifyIndex();
  }

  /**
   * Navigate to the first sentence.
   */
  first() {
    this._corpus.first();
    this.afterModifyIndex();
  }

  /**
   * Decrement the current index if possible, otherwise do nothing.
   */
  prev() {
    this._corpus.prev();
    this.afterModifyIndex();
  }

  /**
   * Increment the current index if possible, otherwise do nothing.
   */
  next() {
    this._corpus.next();
    this.afterModifyIndex();
  }

  /**
   * Navigate to the last sentence.
   */
  last() {
    this._corpus.last();
    this.afterModifyIndex();
  }

  /**
   * Get the nx.Sentence at <index>.
   *
   * @param {Number} index
   * @return {(nx.Sentence|null)}
   */
  getSentence(index) {
    return this._corpus.getSentence(index);
  }

  /**
   * Set a serial value for the nx.Sentence at <index>.
   *
   * @param {Number} index
   * @param {(String|Object)} text
   * @param {Boolean} main whether or not to broadcast updates
   * @return {nx.Sentence}
   */
  setSentence(index, text, main=true) {

    // do the work under the hood
    const sent = this._corpus.setSentence(index, text);

    // add some metadata
    sent._meta.format = detectFormat(text);

    // maybe broadcast stuff
    if (main) {
      this.app.save({
        type: 'set',
        indices: [index || this.index],
      });
      this.afterModifyIndex();
    }

    // return the affected guy
    return sent;
  }

  /**
   * Insert an nx.Sentence (with serial value <text>) after <index>.
   *
   * @param {Number} index
   * @param {(String|Object)} text
   * @param {Boolean} main whether or not to broadcast updates
   * @return {nx.Sentence}
   */
  insertSentence(index, text, main=true) {

    // do the work under the hood
    const sent = this._corpus.insertSentence(index, text);

    // add some metadata
    sent._meta.format = detectFormat(text);

    // maybe broadcast stuff
    if (main) {
      this.app.save({
        type: 'insert',
        indices: [index || this.index],
      });
      this.afterModifyIndex();
    }

    // return the new guy
    return sent;
  }

  /**
   * Remove the nx.Sentence at <index>.
   *
   * @param {Number} index
   * @param {Boolean} main whether or not to broadcast updates
   * @return {nx.Sentence}
   */
  removeSentence(index, main=true) {

    // do the work under the hood
    const sent = this._corpus.removeSentence(index);

    // maybe broadcast stuff
    if (main) {
      this.app.save({
        type: 'remove',
        indices: [index || this.index],
      });
      this.afterModifyIndex();
    }

    // return the removed guy
    return sent;
  }

  /**
   * Split the incoming text (on double newlines or punctuation).  The first
   *  item will overwrite the current sentence, with sentences inserted seqntially
   *  thereafter.
   *
   * @param {(String|Object)} text
   * @param {Boolean} main whether or not to broadcast updates
   * @return {nx.Sentence}
   */
  parse(text, main=true) {

    // split under the hood
    const splitted = nx.split(text, this._corpus.options);

    // get the index to start at
    const index = this.index || 0;

    // iterate over all the pieces, get a list of affected indices
    const sents = splitted.map((split, i) => {

      if (i) { // insert *after* the first one
        this.insertSentence(index + i, split, false);
      } else { // overwrite the first  one
        this.setSentence(index, split, false);
      }

      return index + i;
    });

    // maybe broadcast stuff
    if (main) {
      this.app.save({
        type: 'parse',
        indices: [index || this.index],
      });
      this.afterModifyIndex();
    }

    // return the indices of the affected guys
    return sents;
  }
}


module.exports = Corpus;
