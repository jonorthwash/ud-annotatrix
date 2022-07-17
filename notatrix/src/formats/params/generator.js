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

  const output = sent.tokens.map(token => {
    if (token.analysis)
      throw new GeneratorError(
          "Unable to generate, contains ambiguous analyses or multiword tokens");

    let params = _.pick(token, utils.fields);
    params.head = token.getHead();

    return _.pick(params, value => value != undefined);
  });

  return {
    output: output,
    loss: getLoss(sent),
  };
};
