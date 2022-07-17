"use strict";

module.exports = {

  name: "Params",
  fields: require("./fields"),
  split: require("./splitter").split,
  detect: require("./detector").detect,
  parse: require("./parser"),
  generate: require("./generator").generate,

};
