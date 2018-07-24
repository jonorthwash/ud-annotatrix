'use strict';

const _ = require('underscore');


// for meta
const defaults = {
  gui: [
    'are_labels_visible',
    'is_enhanced',
    'is_ltr',
    'is_textare_visible',
    'is_vertical',
  ],
  menu: [
    'is_visible',
    'pinned'
  ],
  labeler: [
    'labels',
    'filter'
  ],
  current_index: 'number',
  owner: 'string',
  github_url: 'string',
  permissions: [
    'allow',
    'disallow',
    'require_login'
  ],
  editors: 'object'
};

function meta(meta) {
  let ret = {};
  _.each(defaults, (value, key) => {
    if (Array.isArray(value)) {
      const filtered = _.pick(meta[key], value);
      ret[key] = Object.keys(filtered).length ? JSON.stringify(filtered) : null;
    } else {
      ret[key] = typeof meta[key] === value ? JSON.stringify(meta[key]) : null;
    }
  });
  return ret;
}

function sentence(data) {
  if (data)
    data = JSON.stringify(data);

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
