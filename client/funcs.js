'use strict';

/**
 * shared functions
 */

const _ = require('underscore');
const $ = require('jquery');

const status = require('./status');

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
  },

  getTreebankId: () => {
    const match = location.href.match(/treebank_id=([0-9a-f-]{36})(#|\/|$|&)/);
    if (!match) {
      status.error('invalid treebank url, must be valid UUID4');
      return;
    }

    return match[1];
  },

  link: (href, target='_blank') => {
    const link = $('<a>')
      .attr('href', href)
      .attr('target', target);
    $('body').append(link);
    link[0].click();
  },

  noop: arg => arg,

  getUsername: data => {
    return data.username || '<Anonymous>';
  },

  getPresentUsers: room => {
    return Object.keys(room.users).length;
  },

  dedup: (master, slave) => {

    let dedup = {};

    _.each(slave, (value, key) => {
      if (master[key] !== value)
        dedup[key] = value;
    });

    return dedup;
  },

};
