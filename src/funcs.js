'use strict';

/**
 * shared functions
 */

const _ = require('underscore');
const $ = require('jquery');

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
  },

  download: (filename, mimetype, uriComponent) => {
    if (!gui.inBrowser)
      return false;

    const link = $('<a>')
      .attr('download', filename)
      .attr('href', `data:${mimetype}; charset=utf-8,${encodeURIComponent(uriComponent)}`);
    $('body').append(link);
    link[0].click();
    return true;
  }

};
