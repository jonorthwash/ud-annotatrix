'use strict';

const $ = require('jquery');
const cfg = require('./config');

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
  div.fadeOut(cfg.statusNormalFadeout);
  setTimeout(div.detach, cfg.statusNormalFadeout);
}

function error(text) {

  const div = status(text, true);
  container.prepend(div);
  div.fadeOut(cfg.statusErrorFadeout);
  setTimeout(div.detach, cfg.statusErrorFadeout);
}


module.exports = {
  normal,
  error,
};
