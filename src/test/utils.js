'use strict';

const _ = require('underscore');
const data = require('./data/index');

function noop() {}

// regex
const punct = /([.?!])/,
  puncts = /([.?!]+)/g;

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
  },

  reformatParsedText: (text) => {
    return text.trim().replace(puncts, ' $1').replace(/(\s)+/g, ' ').trim();
  },

  randomInt: (min, max) => {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * max) + min;
  },

};
