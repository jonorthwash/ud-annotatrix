"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const ParserError = utils.ParserError;
const detect = require("./detector").detect;

module.exports = (obj, options) => {
  try {
    detect(obj, options);
  } catch (e) {
    if (e instanceof utils.DetectorError)
      throw new ParserError(e.message);

    throw e;
  }

  return obj;
};
