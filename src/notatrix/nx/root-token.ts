"use strict";

import {BaseToken} from "./base-token";
import type {Sentence} from "./sentence";

export class RootToken extends BaseToken {
  constructor(sent: Sentence) {
    super(sent, "RootToken");

    this.form = "ROOT";
    this.indices = {
      absolute: 0,
      conllu: 0,
      cytoscape: 0,
    };
  }
}
