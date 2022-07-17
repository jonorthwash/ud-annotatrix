"use strict";

module.exports = {

  name: "apertium stream",
  fields: require("./fields"),
  split: require("./splitter").split,
  detect: require("./detector"),
  parse: require("./parser"),
  generate: require("./generator").generate,

};
