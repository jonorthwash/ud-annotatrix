"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const DetectorError = utils.DetectorError;

module.exports = (text, options) => {
  options = _.defaults(options, {
    allowEmptyString: true,
    allowNewlines: false,
    bracketsAllowanceTreshold: 0.2, // set to <0 or >1 to avoid
  });

  /*
  if (!text && !options.allowEmptyString)
    throw new DetectorError(`Illegal plain text: empty string`, text,
  options);
    */

  if (utils.isJSONSerializable(text))
    throw new DetectorError(`Illegal plain text: JSON object`, text, options);

  if (/\n/.test(text) && !options.allowNewlines)
    throw new DetectorError(`Illegal plain text: contains newlines`, text,
                            options);

  if (options.bracketsAllowanceTreshold >= 0) {
    const numWords = text.split(utils.re.whitespace).length;
    const numBrackets = (text.match(/[\[\]]/g) || []).length;
    const ratio = numBrackets / numWords;

    if (ratio > options.bracketsAllowanceTreshold)
      throw new DetectorError(
          `Illegal plain text: contains too many brackets (${ratio})`, text,
          options);
  }

  return "plain text";
};
