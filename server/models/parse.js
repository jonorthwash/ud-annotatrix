'use strict';

const _ = require('underscore');

function parse(obj) {
  _.each(obj, (value, key, obj) => {
    obj[key] = JSON.parse(value);
  });

  return obj;
}

module.exports = parse;
