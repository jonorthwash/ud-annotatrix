"use strict";

const _ = require("underscore");

const constants = require("./constants");
const errors = require("./errors");
const funcs = require("./funcs");
const regex = require("./regex");

module.exports = _.extend({re: regex}, errors, constants, funcs);
