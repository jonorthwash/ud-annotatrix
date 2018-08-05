'use strict';

const _ = require('underscore');
const nx = require('notatrix');
const errors = require('./errors');
const status = require('./status');
const funcs = require('./funcs');

function encode(serial, options) {
  try {

    let format = detectFormat(serial, options)

    options = _.extend({
      interpretAs: format,
      allowEmptyString: true,
    }, options);

    return {
      format: format,
      sent: new nx.Sentence(serial, options),
    };

  } catch (e) {

    if (e instanceof nx.NotatrixError) {

      //debugger;
      console.log(e);
      gui.status.error('Unable to interpret input, disabling autoparsing and unsyncing')
      return null;

    } else {

      throw e;

    }
  }
}

function detectFormat(serial, options) {

  if (!serial)
    return 'plain text';

  const formats = nx.detect(serial, {
    suppressDetectorErrors: true,
    returnAllMatches: true,
    allowEmptyString: true,
  });

  if (formats.length === 0) {
    throw new nx.NotatrixError('Unable to interpret input');

  } else if (formats.indexOf('notatrix serial') > -1) {

    return 'notatrix serial';

  } else if (formats.length === 1) {

    console.log(`Interpreting as ${formats[0]}`);
    return formats[0];

  } else {

    // order we'd want to display in if we get multiple hits
    const preferences = [
      'CoNLL-U',
      'CG3',
      'SD',
      'plain text',
      'Brackets',
    ];

    for (let i=0; i<preferences.length; i++) {
      const pref = preferences[i];
      if (formats.indexOf(pref) > -1) {
        status.normal(`Interpreting as ${pref}`);
        return pref;
      }
    }

    // just choose one
    status.normal(`Interpreting as ${formats[0]}`);
    return formats[0];

  }
}

class Sentence {
  constructor(serial, options) {

    const encoded = encode(serial, options);

    if (encoded) {

      this.parsed = true;
      this.format = encoded.format;
      this._nx = encoded.sent;

    } else {

      gui.status.error('')
      this.parsed = false;
      this.format = null;
      this._nx = null;

    }

    this.conversion_warning = null;
    this.column_visibilities = new Array(10).fill(true);
    this.is_table_view = false;
    this.is_ltr = true;
    this.is_vertical = false;

    labeler.parse(this._nx.comments);

  }

  toString(format) {

    if (!this.parsed)
      throw new Error('cannot cast unparsed text to string');

    if (this.format === 'notatrix serial')
      this.format = 'plain text';
    format = format || this.format;

    try {

      const converted = this._nx.to(format);
      this.conversion_warning = converted.loss.length
        ? `Unable to convert: ${converted.loss.join(', ')}`
        : null;

      return converted.output;

    } catch (e) {
      if (e instanceof nx.GeneratorError) {

        status.error(e.message);
        return null;

      } else {

        throw e;

      }
    }

  }

  update(serial, options) {

    try {

      if (!this.parsed)
        throw new Error();

      this._nx.update(serial, options);

    } catch (e) {

      const encoded = encode(serial, options);

      if (encoded) {

        this.parsed = true;
        this._nx = encoded.sent;
        this.format = encoded.format;
        labeler.parse(this._nx.comments);

      } else {

        this.parsed = false;
        this._nx = null;
        this.format = null;

      }
    }

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

    const state = this._nx.serialize();
    state._meta.format = this.format;
    state._meta.is_table_view = gui.is_table_view;
    state._meta.is_ltr = gui.is_ltr;
    state._meta.is_vertical = gui.is_vertical;
    state.meta.column_visibilities = this.column_visibilities;
    state.meta.pan = gui.pan;
    state.meta.zoom = gui.zoom;

    return state;
  }

  set state(state) {

    const options = _.defaults(state.options, manager.options);
    this.update(state, options);
    this.format = state._meta.format || this.format;
    this.column_visibilities = state.meta.column_visibilities || this.column_visibilities;
    this.is_table_view = state._meta.is_table_view || this.is_table_view;
    this.is_ltr = state._meta.is_ltr || this.is_ltr;
    this.is_vertical = state._meta.is_vertical || this.is_vertical;

    gui.pan = state.meta.pan;
    gui.zoom = state.meta.zoom;

    return this;
  }
}

module.exports = Sentence;
