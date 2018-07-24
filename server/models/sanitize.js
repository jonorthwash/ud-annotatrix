'use strict';

const _ = require('underscore');

function sanitize(obj, keys) {
  obj = _.pick(obj, keys);
  _.each(obj, (value, key, obj) => {
    obj[key] = JSON.stringify(value);
  });

  return obj;
}

module.exports = {

  meta: meta => sanitize(meta, [
    'current_index',
    'owner',
    'github_url',
    'gui',
    'labeler',
    'permissions',
    'editors'
  ]),

  sentence: sentence => sanitize(sentence, [
    'column_visibilities',
    'format',
    'is_table_view',
    'nx_initialized',
    'nx'
  ])

};
