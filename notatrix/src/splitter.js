"use strict";

const _ = require("underscore");

const utils = require("./utils");
const defaultSplitter = require("./formats/default-splitter").split;
const detector = require("./detector");
const SplitterError = utils.SplitterError;

let as = {

  "apertium stream": require("./formats/apertium-stream").split,
  apertiumStream: require("./formats/apertium-stream").split,
  Brackets: require("./formats/brackets").split,
  brackets: require("./formats/brackets").split,
  CG3: require("./formats/cg3").split,
  cg3: require("./formats/cg3").split,
  "CoNLL-U": require("./formats/conllu").split,
  conllu: require("./formats/conllu").split,
  "notatrix serial": require("./formats/notatrix-serial").split,
  notatrixSerial: require("./formats/notatrix-serial").split,
  Params: require("./formats/params").split,
  params: require("./formats/params").split,
  "plain text": require("./formats/plain-text").split,
  plainText: require("./formats/plain-text").split,
  SD: require("./formats/sd").split,
  sd: require("./formats/sd").split,

};

module.exports = (text, options) => {
  let fromDefault = new Set();
  const splitAsDefault = defaultSplitter(text, options);
  splitAsDefault.forEach(line => {
    detector(line, options).forEach(format => fromDefault.add(format));
  });

  let fromPlainText = new Set();
  const splitAsPlainText = as.plainText(text, options);
  splitAsPlainText.forEach(line => {
    detector(line, options).forEach(format => fromPlainText.add(format));
  });

  if (fromDefault.size !== 1 && fromPlainText.size === 1 &&
      fromPlainText.has("plain text"))
    return splitAsPlainText;

  return splitAsDefault;
};
module.exports.as = as;
module.exports.onNewlines = require("./formats/default-splitter");
