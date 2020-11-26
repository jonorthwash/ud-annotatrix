"use strict";

const utils = require("../../utils");
const SplitterError = utils.SplitterError;

module.exports = (text, options) => {
  throw new SplitterError("Can't split notatrix serial", text, options);
};
