"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const ParserError = utils.ParserError;
const detect = require("./detector");

module.exports = (obj, options) => {
  try {
    detect(obj, options);
  } catch (e) {
    if (e instanceof utils.DetectorError)
      throw new ParserError(e.message);

    throw e;
  }

  return {
    input: JSON.stringify(obj),
    options: options,
    comments: [],
    tokens: obj.map((token, i) => {
      token.index = `${i}`;
      return token;
    }),
  };
};
