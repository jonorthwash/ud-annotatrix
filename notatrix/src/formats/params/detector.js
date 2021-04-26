"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const DetectorError = utils.DetectorError;

module.exports = (obj, options) => {
  options = _.defaults(options, {
    allowEmptyList: false,
    allowTrailingWhitespace: true,
    allowLeadingWhitespace: true
  });

  if (!utils.isJSONSerializable(obj))
    throw new DetectorError(`Illegal Params: not JSON object`, obj, options);

  obj = typeof obj === "string" ? JSON.parse(obj) : obj;

  if (Array.isArray(obj)) {
    if (!obj.length && !options.allowEmptyList)
      throw new DetectorError(`Illegal Params: contains no tokens`, obj,
                              options);

    obj.forEach(obj => {
      const omitted = Object.keys(_.omit(obj, utils.fields));
      if (omitted.length)
        throw new DetectorError(
            `Illegal Params: contains illegal keys (${omitted.join(", ")})`,
            obj, options);

      const picked = Object.keys(_.pick(obj, utils.fields));
      if (!picked.length)
        throw new DetectorError(`Illegal Params: missing required keys`, obj,
                                options);
    });

  } else {
    throw new DetectorError(
        `Illegal Params: expected array of parameters, got ${typeof obj}`, obj,
        options)
  }

  return "Params";
};
