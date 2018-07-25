'use strict';

const _ = require('underscore');
const nx = require('notatrix');

const errors = require('./errors');
const detectFormat = require('./detect');
const convert = require('./convert');

function encode(serial) {
  const format = detectFormat(serial);
  switch (format) {

    case ('Unknown'):
      return nx.Sentence.fromParams([]);

    case ('plain text'):
      return nx.Sentence.fromText(serial);

    case ('CoNLL-U'):
      return nx.Sentence.fromConllu(serial);

    case ('CG3'):
      return nx.Sentence.fromCG3(serial);

    default:
      serial = convert.to.conllu(serial);
      return nx.Sentence.fromConllu(serial);
  }

}

class Sentence {
  constructor(serial) {

    this._input = serial;

    this.format = detectFormat(serial);
    this._nx = encode(serial);

    this.is_table_view = false;
    this.column_visibilities = new Array(10).fill(true);

    labeler.parse(this._nx.comments);

  }

  toString() {
    switch (this.format) {
      case ('Unknown'):
        return '';

      case ('plain text'):
        return this._nx.text;

      case ('CoNLL-U'):
        return this._nx.conllu;

      case ('CG3'):
        return this._nx.cg3;

      default:
        return this._input || '';
    }
  }

  update(serial) {

    const updated = {
      format: detectFormat(serial),
      nx: encode(serial)
    };

    // if they're not the same format, check if they're the same text (i.e.,
    //   different encodings of the same sentence)
    if (updated.format !== this.format && updated.nx.text === this.text) {

      const oldNx = this.nx,
        newNx = updated.nx.nx;

      for (let i=0; i<newNx.tokens.length; i++) {
        let oldToken = oldNx.tokens[i],
          newToken = newNx.tokens[i];

        if (!oldToken)
          continue;

        for (let j=0; j<newToken.analyses.length; j++) {
          let oldAnalysis = oldToken.analyses[j],
            newAnalysis = newToken.analyses[j];

          if (!oldAnalysis)
            continue;

          _.each(newAnalysis.values, (value, key) => {
            newAnalysis.values[key] = (!!value && value !== '_')
              ? value
              : oldAnalysis.values[key];
          });
        }
      }

      updated.nx.tokens = nx.Sentence.fromNx(newNx).tokens;
      updated.nx.comments = updated.nx.comments.length
        ? updated.nx.comments
        : this._nx.comments;
    }

    this._input = serial;
    this._nx = updated.nx;
    this.format = updated.format;
    labeler.parse(this._nx.comments);
    return this;

  }

  clear() {

    this._input = null;
    this.format = detectFormat(null);
    this._nx = encode(null);
    return this;

  }

  get(id) {
    return this._nx.getById(id);
  }

  get conllu() {
    return this._nx.conllu;
  }

  get cg3() {
    return this._nx.cg3;
  }

  get text() {
    return this._nx.text;
  }

  get nx() {
    return this._nx.nx;
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
      nx: this._nx.nx,
      input: this._input
    };
  }

  set state(state) {

    this._input = state.input;
    this.column_visibilities = state.column_visibilities;
    this.format = state.format;
    this.is_table_view = state.is_table_view;
    this._nx = nx.Sentence.fromNx(state.nx);

    return this;
  }
}

module.exports = Sentence;
