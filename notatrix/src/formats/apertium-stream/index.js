"use strict";

module.exports = {

  name: "apertium stream",
  fields: require("./fields"),
  split: require("./splitter").split,
  detect: require("./detector").detect.detect,
  parse: require("./parser"),
  generate: require("./generator").generate,

};
