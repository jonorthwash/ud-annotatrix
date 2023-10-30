"use strict";

import {BaseToken, TokenSerial} from "./base-token";
import type {Sentence} from "./sentence";

export class SubToken extends BaseToken {
  constructor(sent: Sentence, serial: TokenSerial) { super(sent, "SubToken", serial); }
}
