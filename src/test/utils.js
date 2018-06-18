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
    global.log = new Log('ERROR');

  },

  forEachText: (callback) => {

    callback = callback || noop;

    _.each(data, (texts, format) => {
      _.each(texts, (text, name) => {
        callback(text, format, name);
      });
    });
  }
};
