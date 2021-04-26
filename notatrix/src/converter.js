"use strict";

const _ = require("underscore");

const utils = require("./utils");
const ConverterError = utils.ConverterError;
const nx = require("./nx");

module.exports = (input, options) => {
  try {
    var sent = new nx.Sentence(input, options);
    sent.from = format =>
        convert(sent.input, _.extend({interpretAs: format}, options));

    return sent;

  } catch (e) {
    if (e instanceof utils.ToolError || e instanceof utils.NxError)
      throw new ConverterError("FATAL: unable to convert: " + e.message);

    throw e;
  }
};
