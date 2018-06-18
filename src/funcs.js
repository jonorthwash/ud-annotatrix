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

};
