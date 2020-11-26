"use strict";

const _ = require("underscore");

const utils = require("../utils");
const BaseToken = require("./base-token");

class SubToken extends BaseToken {
  constructor(sent, serial) { super(sent, "SubToken", serial); }
}

module.exports = SubToken;
