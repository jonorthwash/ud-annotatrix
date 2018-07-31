'use strict';

const _ = require('underscore');
const nx = require('notatrix');
const errors = require('./errors');
const status = require('./status');

function encode(serial, options) {

  let format = null;

  const formats = nx.detect(serial, {
    suppressDetectorErrors: true,
    returnAllMatches: true,
    allowEmptyString: true,
  });

  if (formats.length === 0) {

    status.error('Unable to interpret input');
    serial = '';
    format = 'plain text'

  } else if (formats.indexOf('notatrix serial') > -1) {

    is_notatrix_serial = true;
    format = 'notatrix serial';

  } else if (formats.length === 1) {

    format = formats[0];
    status.normal(`Interpreting as ${format}`);

  } else {

    const preferences = [
      'CoNLL-U',
      'CG3',
      'plain text',
    ];

    for (let i=0; i<preferences.length; i++) {
      const pref = preferences[i];
      if (formats.indexOf(pref) > -1) {
        format = pref;
        status.normal(`Interpreting as ${format}`);
        break;
      }
    }

    // just choose one
    format = formats[0];
    status.normal(`Interpreting as ${format}`);

  }

  if (format === 'notatrix serial')
    format = 'CoNLL-U';

  options = _.extend({
    interpretAs: format,
    allowEmptyString: true,
  }, options);
  return {
    format: format,
    sent: new nx.Sentence(serial, options),
  }
}

class Sentence {
  constructor(serial, options) {

    const encoded = encode(serial, options);

    this.format = encoded.format;
    this._nx = encoded.sent;

    this.is_table_view = false;
    this.column_visibilities = new Array(10).fill(true);

    labeler.parse(this._nx.comments);

  }

  toString(format) {

    format = format || this.format;

    try {

      return this._nx.to(format);

    } catch (e) {

      if (e instanceof nx.Loss) {

        status.error(e.message);
        return e.output;

      } else if (e instanceof nx.GeneratorError) {

        status.error(e.message);
        return null;

      }

      throw e;
    }

  }

  update(serial, options) {

    try {

      this._nx.update(serial, options);

    } catch (e) {

      const encoded = encode(serial, options);
      this._nx = encoded.sent;

    }

    labeler.parse(this._nx.comments);
    return this;

  }

  clear() {

    this.format = null;
    this._nx = null;
    return this;

  }

  get(id) {
    return this._nx.query(e => e.indices.absolute === id)[0];
  }

  get conllu() {
    return this.toString('CoNLL-U');
  }

  get cg3() {
    return this.toString('CG3');
  }

  get text() {
    return this.toString('plain text');
  }

  get nx() {
    return this.toString('notatrix serial');
  }

  get comments() {
    return this._nx.comments;
  }

  set comments(comments) {
    this._nx.comments = comments;
    return this;
  }

  get state() {
    return {
      column_visibilities: this.column_visibilities,
      format: this.format,
      is_table_view: this.is_table_view,
      nx: this._nx.to.notatrixSerial,
      input: this._input
    };
  }

  set state(state) {

    this._input = state.input;
    this.column_visibilities = state.column_visibilities;
    this.format = state.format;
    this.is_table_view = state.is_table_view;
    this._nx = new nx.Sentence(state.nx);

    return this;
  }
}

module.exports = Sentence;
