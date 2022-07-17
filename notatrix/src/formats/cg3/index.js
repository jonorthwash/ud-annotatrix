"use strict";

module.exports = {

  name: "CG3",
  fields: require("./fields"),
  split: require("../default-splitter").split,
  detect: require("./detector"),
  parse: require("./parser"),
  generate: require("./generator"),

};
