"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const Loss = utils.Loss;
const fields = require("./fields");

module.exports = sent => {
  // do nothing, can't lose info on this one
  return [];
};
