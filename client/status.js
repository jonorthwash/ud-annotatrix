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

  const div = Status(`| ${text}`, false)
    .fadeOut(cfg.statusNormalFadeout);

  $('#status-container .flowing').prepend(div);

  setTimeout(div.detach, cfg.statusNormalFadeout);
}

function error(text) {

  if (!gui.inBrowser)
    return null;

  const div = Status(`| Error: ${text}`, true)
    .fadeOut(cfg.statusErrorFadeout);

  $('#status-container .flowing').prepend(div);

  setTimeout(div.detach, cfg.statusErrorFadeout);
}

function update() {

  const current = $('#current-status');

  try {
    if (!cy.elements().length) {

      current.text('uninitialized');
      return;
    }
  } catch (e) { }

  // set the status now that we're sure we have a graph
  if (cy.$('.splitting').length) {

    current.text('splitting node');

  } else if (cy.$('.merge-source').length) {

    current.text('merging tokens');

  } else if (cy.$('.combine-source').length) {

    current.text('forming multiword token');

  } else if (!gui.editing) {

    current.text('viewing');

  } else {

    current.text('editing ' + gui.editing.data('name'));

  }
}

module.exports = {
  normal,
  error,
  update,
};
