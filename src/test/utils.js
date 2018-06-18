'use strict';

const _ = require('underscore');
const data = require('./data/index');

function noop() {}

module.exports = {
  noop,

  setupLogger: () => {

    if (global.log)
      return;

    const Log = require('../node-logger');
    global.log = new Log('WARN');

  },

  forEachText: (callback) => {

    callback = callback || noop;

    _.each(data, (texts, format) => {

      // this one isn't a string so skip it
      if (format === 'Params')
        return;

      _.each(texts, (text, name) => {
        callback(text, format, name);
      });
    });
  }
};
