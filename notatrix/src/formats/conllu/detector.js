"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const DetectorError = utils.DetectorError;

module.exports = (text, options) => {
  options = _.defaults(options, {
    allowEmptyString: false,
    requireTenParams: false,
    allowTrailingWhitespace: true,
  });

  if (!text && !options.allowEmptyString)
    throw new DetectorError(`Illegal CoNLL-U: empty string`, text, options);

  if (utils.isJSONSerializable(text))
    throw new DetectorError(`Illegal CoNLL-U: JSON object`, text, options);

  // be more or less strict about the fields we require being set
  const tokenLine = options.requireTenParams ? utils.re.conlluTokenLineTenParams
                                             : utils.re.conlluTokenLine;

  // internal stuff
  let doneComments = false;
  let doneContent = false;

  // iterate over the lines and check each one
  const lines = text.split(/\n/);
  lines.forEach((line, i) => {
    if (utils.re.comment.test(line)) {
      // can only have comments at the beginning
      if (doneComments)
        throw new DetectorError(`Illegal CoNLL-U: misplaced comment`, text,
                                options);

    } else {
      // done parsing comments
      doneComments = true;

      if (line) {
        if (!tokenLine.test(line))
          throw new DetectorError(`Illegal CoNLL-U: unmatched line`, text,
                                  options);

        if (doneContent)
          throw new DetectorError(`Illegal CoNLL-U: misplaced whitespace`, text,
                                  options);

      } else {
        // only allow empty lines after we've looked at all the content
        if (!options.allowTrailingWhitespace)
          throw new DetectorError(
              `Illegal CoNLL-U: contains trailing whitespace`, text, options);

        doneContent = true;
      }
    }
  });

  return "CoNLL-U";
};
