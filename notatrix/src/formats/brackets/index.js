"use strict";

module.exports = {

  name: "Brackets",
  fields: require("./fields"),
  split: require("../default-splitter").split,
  detect: require("./detector"),
  parse: require("./parser"),
  generate: require("./generator").generate,

};
