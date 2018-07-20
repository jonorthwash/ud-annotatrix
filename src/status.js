'use strict';

const $ = require('jquery');

const container = $('.status-container');

function status(text, isError) {
  return $('<div>')
    .addClass('status')
    .addClass(isError ? 'error' : 'normal')
    .text(text);
}

function normal(text) {

  const div = status(text, false);
  container.prepend(div);
  div.fadeOut(3000);
}

function error(text) {

  const div = status(text, true);
  container.prepend(div);
  div.fadeOut(5000);
}


module.exports = {
  normal,
  error,
};
