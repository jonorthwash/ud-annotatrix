"use strict";

module.exports = {

  name: "Brackets",
  fields: require("./fields"),
  split: require("../default-splitter").split,
  detect: require("./detector").detect,
  parse: require("./parser").parse,
  generate: require("./generator").generate,

};
