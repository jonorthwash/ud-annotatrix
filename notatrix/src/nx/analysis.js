"use strict";

const _ = require("underscore");

const utils = require("../utils");
const NxError = utils.NxError;
const NxBaseClass = require("./base-class");
const SubToken = require("./sub-token");

/**
 * Abstraction over a CG3 analysis.  Most sentences have just one of these for
 *  each token.
 */
class Analysis extends NxBaseClass {
  constructor(sent, serial) {
    super(sent, "Analysis");
    this._subTokens =
        (serial.subTokens || []).map(sub => new SubToken(sent, sub));
  }

  get subTokens() { return this._subTokens; }
}

module.exports = Analysis;
