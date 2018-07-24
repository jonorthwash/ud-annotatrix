'use strict';

const _ = require('underscore');


// for meta
const defaults = {
  gui: {
    are_labels_visible: true,
    is_enhanced: false,
    is_ltr: true,
    is_textare_visible: true,
    is_vertical: false,
  },
  menu: {
    is_visible: false,
    pinned: {
      'discard-corpus': false,
      'download-corpus': false,
      'export-as-latex': false,
      'export-as-png': false,
      'export-as-svg': false,
      login: false,
      'manage-permissions': false,
      'save-corpus': false,
      'show-help': true,
      'show-settings': false,
      'show-table': false,
      'upload-corpus': false
    }
  },
  labeler: {
    labels: [],
    filter: []
  },
  current_index: -1,
  owner: null,
  github_url: null,
  permissions: {
    allow: null,
    disallow: [],
    require_login: false
  },
  editors: []
};

function meta(meta) {
  let ret = {};
  _.each(defaults, (value, key) => {
    if (typeof value === 'object') {
      ret[key] = meta[key] ? JSON.parse(meta[key]) : value;
    } else {
      ret[key] = meta[key] || value
    }
  });
  return ret;
}

function sentence(data) {
  if (data)
    data = JSON.parse(data);

  return data;
}

function sentences(data) {
  if (data)
    data = data.map(sentence);

  return data;
}

module.exports = {
  meta,
  sentence,
  sentences
};
