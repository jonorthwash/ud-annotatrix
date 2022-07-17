"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const GeneratorError = utils.GeneratorError;
const getLoss = require("./get-loss").getLoss;

module.exports = (sent, options) => {
  if (!sent.isParsed)
    return {
      output: null,
      loss: undefined,
    };

  if (!sent || sent.name !== "Sentence")
    throw new GeneratorError(`Unable to generate, input not a Sentence`, sent,
                             options);

  options = _.defaults(options, sent.options,
                       {

                       });

  sent.index();

  return {
    output: sent.serialize(),
    loss: getLoss(sent),
  };
};
