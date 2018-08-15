'use strict';

const _ = require('underscore');
const $ = require('jquery');
const uuidv4 = require('uuid/v4');


function check_if_browser() {
  try {
    return !!window;
  } catch (e) {
    return false;
  }
}


module.exports = {

  check_if_browser,

  download: (filename, mimetype, uriComponent) => {

    const link = $('<a>')
      .attr('download', filename)
      .attr('href', `data:${mimetype}; charset=utf-8,${encodeURIComponent(uriComponent)}`);
    $('body').append(link);
    link[0].click();
    return true;
  },

  getTreebankId: () => {

    if (!check_if_browser())
      return null;

    const match = location.href.match(/treebank_id=([0-9a-f-]{36})(#|\/|$|&)/);
    return match ? match[1] : uuidv4();
  },

  link: (href, target='_blank') => {
    const link = $('<a>')
      .attr('href', href)
      .attr('target', target);
    $('body').append(link);
    link[0].click();
  },

  noop: arg => arg,

  thin: arg => !!arg ? arg : undefined,

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

  forEachFormat: callback => {
    ['Brackets', 'CG3', 'CoNLL-U', 'plain text', 'SD'].forEach(callback);
  },
};
