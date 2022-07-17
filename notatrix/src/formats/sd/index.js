"use strict";

module.exports = {

  name: "SD",
  fields: require("./fields"),
  split: require("../default-splitter").split,
  detect: require("./detector").detect,
  parse: require("./parser"),
  generate: require("./generator").generate,

};
