"use strict";

const _ = require("underscore");

const utils = require("../utils");
const BaseToken = require("./base-token");

class RootToken extends BaseToken {
  constructor(sent) {
    super(sent, "RootToken");

    this.form = "ROOT";
    this.indices = {
      absolute: 0,
      conllu: 0,
      cg3: 0,
      cytoscape: 0,
    };
  }
}

module.exports = RootToken;
