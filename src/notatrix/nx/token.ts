"use strict";

import {Analysis} from "./analysis";
import {BaseToken, TokenSerial} from "./base-token";
import {SubToken} from "./sub-token";
import type {Sentence} from "./sentence";

export class Token extends BaseToken {
  _i: number|null;

  constructor(sent: Sentence, serial: TokenSerial) {
    super(sent, "Token", serial);

    this._analyses =
        (serial.analyses || []).map(ana => new Analysis(sent, ana));
    this._i = (this._analyses.length ? 0 : null);
  }

  get analysis(): Analysis|null {
    if (this._i === null)
      return null;

    return this._analyses[this._i];
  }

  get subTokens(): SubToken[] { return this.analysis ? this.analysis.subTokens : []; }
}
