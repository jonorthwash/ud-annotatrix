"use strict";

const _ = require("underscore");

const utils = require("./utils");
const DetectorError = utils.DetectorError;

let as = {

  "apertium stream": require("./formats/apertium-stream").detect,
  apertiumStream: require("./formats/apertium-stream").detect,
  Brackets: require("./formats/brackets").detect,
  brackets: require("./formats/brackets").detect,
  CG3: require("./formats/cg3").detect,
  cg3: require("./formats/cg3").detect,
  "CoNLL-U": require("./formats/conllu").detect,
  conllu: require("./formats/conllu").detect,
  "notatrix serial": require("./formats/notatrix-serial").detect,
  notatrixSerial: require("./formats/notatrix-serial").detect,
  Params: require("./formats/params").detect,
  params: require("./formats/params").detect,
  "plain text": require("./formats/plain-text").detect,
  plainText: require("./formats/plain-text").detect,
  SD: require("./formats/sd").detect,
  sd: require("./formats/sd").detect,

};

module.exports = (text, options) => {
  options = _.defaults(options, {
    suppressDetectorErrors: true,
    returnAllMatches: true,
    requireOneMatch: false,
  });

  const matches = utils.formats
                      .map(format => {
                        try {
                          return as [format](text, options);
                        } catch (e) {
                          if (e instanceof DetectorError)
                            return;

                          throw e;
                        }
                      })
                      .filter(utils.thin);

  if (!matches.length && !options.suppressDetectorErrors)
    throw new DetectorError("Unable to detect format", text, options);

  if (matches.length > 1 && !options.suppressDetectorErrors &&
      options.requireOneMatch)
    throw new DetectorError("Detected multiple formats", text, options);

  return options.returnAllMatches ? matches : matches[0];
};
module.exports.as = as;
