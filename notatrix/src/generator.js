"use strict";

const _ = require("underscore");

const utils = require("./utils");
const GeneratorError = utils.GeneratorError;

let as = {

  "apertium stream": require("./formats/apertium-stream").generate,
  apertiumStream: require("./formats/apertium-stream").generate,
  Brackets: require("./formats/brackets").generate,
  brackets: require("./formats/brackets").generate,
  CG3: require("./formats/cg3").generate,
  cg3: require("./formats/cg3").generate,
  "CoNLL-U": require("./formats/conllu").generate,
  conllu: require("./formats/conllu").generate,
  "notatrix serial": require("./formats/notatrix-serial").generate,
  notatrixSerial: require("./formats/notatrix-serial").generate,
  Params: require("./formats/params").generate,
  params: require("./formats/params").generate,
  "plain text": require("./formats/plain-text").generate,
  plainText: require("./formats/plain-text").generate,
  SD: require("./formats/sd").generate,
  sd: require("./formats/sd").generate,

};

module.exports = as;
