"use strict";

const _ = require("underscore");

const utils = require("./utils");
const ParserError = utils.ParserError;

let as = {

  "apertium stream": require("./formats/apertium-stream").parse,
  apertiumStream: require("./formats/apertium-stream").parse,
  Brackets: require("./formats/brackets").parse,
  brackets: require("./formats/brackets").parse,
  CG3: require("./formats/cg3").parse,
  cg3: require("./formats/cg3").parse,
  "CoNLL-U": require("./formats/conllu").parse,
  conllu: require("./formats/conllu").parse,
  "notatrix serial": require("./formats/notatrix-serial").parse,
  notatrixSerial: require("./formats/notatrix-serial").parse,
  Params: require("./formats/params").parse,
  params: require("./formats/params").parse,
  "plain text": require("./formats/plain-text").parse,
  plainText: require("./formats/plain-text").parse,
  SD: require("./formats/sd").parse,
  sd: require("./formats/sd").parse,

};

module.exports = (text, options) => {
  options = _.defaults(options, {
    suppressDetectorErrors: true,
    suppressParserErrors: true,
    returnAllPossibilities: true,
    requireOne: false,
  });

  const possibilities =
      utils.formats
          .map(format => {
            try {
              return as [format](text, options);
            } catch (e) {
              if (e instanceof ParserError && options.suppressParserErrors)
                return;

              throw e;
            }
          })
          .filter(utils.thin);

  if (!possibilities.length && !options.suppressDetectorErrors)
    throw new ParserError("Unable to detect format", text, options);

  if (options.requireOne && possibilities.length > 1)
    throw new ParserError("Unable to detect, ambiguous input");

  return options.returnAllPossibilities ? possibilities : possibilities[0];
};
module.exports.as = as;
