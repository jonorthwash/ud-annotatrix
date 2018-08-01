'use strict';

const _ = require('underscore');
const nx = require('notatrix');
const errors = require('./errors');
const status = require('./status');

function encode(serial, options) {
  try {

    let format = detectFormat(serial, options)

    if (format === 'notatrix serial')
      format = 'CoNLL-U';

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

      console.log(e);
      return {
        format: 'plain text',
        sent: new nx.Sentence('', options),
      }

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

    status.error('Unable to interpret input');
    serial = '';
    return 'plain text';

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
    console.log('encoded', encoded);
    this.format = encoded.format;
    this._nx = encoded.sent;
    this.conversion_warning = null;

    this.is_table_view = false;
    this.column_visibilities = new Array(10).fill(true);

    labeler.parse(this._nx.comments);

  }

  toString(format) {

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

      this._nx.update(serial, options);

    } catch (e) {

      const encoded = encode(serial, options);
      this._nx = encoded.sent;
      this.format = encoded.format;

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
