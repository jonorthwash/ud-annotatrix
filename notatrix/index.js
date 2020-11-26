"use strict";

const _ = require("underscore");
const nx = require("./nx");
const errors = require("./utils/errors");

module.exports = _.extend({

  constants: require("./utils/constants"),
  formats: require("./formats"),
  funcs: require("./utils/funcs"),
  regex: require("./utils/regex"),
  data: require("../data"),

  detect: require("./detector"),
  generate: require("./generator"),
  parse: require("./parser"),
  split: require("./splitter"),
  convert: require("./converter"),

},
                          nx, errors);
