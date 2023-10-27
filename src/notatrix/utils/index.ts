"use strict";

import * as _ from "underscore";

import * as constants from "./constants";
import * as errors from "./errors";
import * as funcs from "./funcs";
import * as regex from "./regex";

module.exports = _.extend({re: regex}, errors, constants, funcs);
