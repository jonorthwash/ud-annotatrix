"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const DetectorError = utils.DetectorError;

module.exports = (obj, options) => {
  function restrict(obj, fields, allowUndefined = false) {
    if (obj === undefined)
      throw new DetectorError(`Illegal notatrix serial: missing field`, obj,
                              options);

    if (_.omit(obj, Object.keys(fields)).length)
      throw new DetectorError(`Illegal notatrix serial: unexpected field`, obj,
                              options);

    _.each(fields, (fieldType, fieldName) => {
      const value = obj[fieldName];

      switch (fieldType) {
      case ("number"):
        if (value !== undefined || !allowUndefined)
          if (isNaN(parseFloat(value)))
            throw new DetectorError(
                `Illegal notatrix serial: could not parse ${value} as float`,
                obj, options);
        break;

      case ("string"):
        if (value !== undefined || !allowUndefined)
          if (typeof value !== "string")
            throw new DetectorError(
                `Illegal notatrix serial: expected 'string', got ${
                    typeof value}`,
                obj, options);
        break;

      case ("string*"):
        if (value !== undefined || !allowUndefined)
          if (value !== null && typeof value !== "string")
            throw new DetectorError(
                `Illegal notatrix serial: expected 'string', got ${
                    typeof value}`,
                obj, options);
        break;

      case ("object"):
        // pass
        break;

      case ("array"):
        if (value != undefined || !allowUndefined)
          if (!Array.isArray(value))
            throw new DetectorError(
                `Illegal notatrix serial: expected Array, got ${typeof value}`,
                obj, options);
        break;
      }
    });
  }

  options = _.defaults(options, {
    allowZeroTokens: true,
    allowZeroFields: true,
  });

  if (!utils.isJSONSerializable(obj))
    throw new DetectorError(`Illegal notatrix serial: not JSON object`, obj,
                            options);

  obj = typeof obj === "string" ? JSON.parse(obj) : obj;

  restrict(obj, utils.nxSentenceFields);
  _.each(obj.comments, comment => {
    if (typeof comment !== "string")
      throw new DetectorError(
          `Illegal notatrix serial: comments should be strings`, obj, options);
  });
  _.each(obj.tokens,
         token => { restrict(token, utils.nxSentenceTokensFields, true); });
  if (obj.tokens.length === 0 && !options.allowZeroTokens)
    throw new DetectorError(
        `Illegal notatrix serial: cannot have empty token list`, obj, options);

  _.each(obj.tokens, token => {
    if (Object.keys(token).length === 0 && !options.allowZeroFields)
      throw new DetectorError(
          `Illegal notatrix serial: cannot have token without fields`, obj,
          options);

    if (token.analyses)
      _.each(token.analyses, analysis => {
        const analysisKeys = Object.keys(analysis);
        if (analysisKeys.length !== 1 || analysisKeys[0] !== "subTokens")
          throw new DetectorError(
              `Illegal notatrix serial: got unexpected analyses field`, obj,
              options);

        _.each(analysis.subTokens, subToken => {
          restrict(subToken, utils.nxSentenceTokensFields, true);
          if (subToken.analyses !== undefined)
            throw new DetectorError(
                `Illegal notatrix serial: subTokens can only have one analysis`,
                obj, options);
        });
      });
  });

  return "notatrix serial";
};
