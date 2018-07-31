'use strict';

const $ = require('jquery');
const cfg = require('./config');

function Status(text, isError) {
  return $('<div>')
    .addClass('status')
    .addClass(isError ? 'error' : 'normal')
    .text(text);
}

function normal(text) {

  if (!gui.inBrowser)
    return null;
    
  const div = Status(text, false);
  $('.status-container').prepend(div);
  div.fadeOut(cfg.statusNormalFadeout);
  setTimeout(div.detach, cfg.statusNormalFadeout);
}

function error(text) {

  if (!gui.inBrowser)
    return null;

  const div = Status(text, true);
  $('.status-container').prepend(div);
  div.fadeOut(cfg.statusErrorFadeout);
  setTimeout(div.detach, cfg.statusErrorFadeout);
}


module.exports = {
  normal,
  error,
};
