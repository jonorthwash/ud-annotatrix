"use strict";

const _ = require("underscore");

const utils = require("../utils");
const BaseToken = require("./base-token");
const Analysis = require("./analysis");

class Token extends BaseToken {
  constructor(sent, serial) {
    super(sent, "Token", serial);

    this._analyses =
        (serial.analyses || []).map(ana => new Analysis(sent, ana));
    this._i = (this._analyses.length ? 0 : null);
  }

  get analysis() {
    if (this._i === null)
      return null;

    return this._analyses[this._i];
  }

  get subTokens() { return this.analysis ? this.analysis.subTokens : []; }
}

module.exports = Token;
