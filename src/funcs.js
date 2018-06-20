'use strict';

/**
 * shared functions
 */

const _ = require('underscore');


module.exports = {

  inBrowser: () => {
    try {
      return !!window;
    } catch (e) {
      return false;
    }
  },

  global: () => {
    try {
      // browser
      return window;
    } catch (e) {
      // node
      return global;
    }
  }

};
