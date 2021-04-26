"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const DetectorError = utils.DetectorError;

module.exports = (text, options) => {
  options = _.defaults(options, {
    allowEmptyString: false,
    allowTrailingWhitespace: true,
    allowLeadingWhitespace: true
  });

  if (!text && !options.allowEmptyString)
    throw new DetectorError("Illegal CG3: empty string", text, options);

  if (utils.isJSONSerializable(text))
    throw new DetectorError("Illegal CG3: JSON object", text, options);

  // internal stuff
  let parsing = null;

  // iterate over the lines and check each one
  text.split(/\n/).forEach(line => {
    if (utils.re.whiteline.test(line)) {
      if (parsing === null) {
        if (!options.allowLeadingWhitespace)
          throw new DetectorError("Illegal CG3: contains leading whitespace",
                                  text, options);

      } else {
        if (parsing !== "token-body" || !options.allowTrailingWhitespace)
          throw new DetectorError("Illegal CG3: contains trailing whitespace",
                                  text, options);
      }

      parsing = "whitespace";

    } else if (utils.re.comment.test(line)) {
      if (parsing === "token-start" || parsing === "token-body")
        throw new DetectorError(
            `Illegal CG3: invalid sequence ${parsing}=>comment`, text, options);

      parsing = "comment";

    } else if (utils.re.cg3TokenStart.test(line)) {
      if (parsing === "token-start")
        throw new DetectorError(
            `Illegal CG3: invalid sequence ${parsing}=>token-start`, text,
            options);

      parsing = "token-start";

    } else if (utils.re.cg3TokenContent.test(line)) {
      if (parsing === "comment" || parsing === "whitespace")
        throw new DetectorError(
            `Illegal CG3: invalid sequence ${parsing}=>token-body`, text,
            options);

      parsing = "token-body";

    } else {
      throw new DetectorError(`Illegal CG3: unmatched line`, text, options);
    }
  });

  return "CG3";
};
