"use strict";

import {NxBaseClass} from "./base-class";
import {SubToken} from "./sub-token";
import {TokenSerial} from "./base-token";
import type {Sentence} from "./sentence";

export interface AnalysisSerial {
  subTokens: TokenSerial[];
}

/**
 * Abstraction over a CG3 analysis.  Most sentences have just one of these for
 *  each token.
 */
export class Analysis extends NxBaseClass {
  _subTokens: SubToken[];

  constructor(sent: Sentence, serial: AnalysisSerial) {
    super("Analysis");
    console.log('Analysis')
    this._subTokens =
        (serial.subTokens || []).map(sub => new SubToken(sent, sub));
  }

  get subTokens(): SubToken[] { 
    console.log('get subTokens()');   
    return this._subTokens; 
  }
}
