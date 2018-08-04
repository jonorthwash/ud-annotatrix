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

  const div = Status(text, false)
    .fadeOut(cfg.statusNormalFadeout);

  $('#status-container .flowing').prepend(div);

  setTimeout(() => div.detach(), cfg.statusNormalFadeout);
}

function error(text) {

  if (!gui.inBrowser)
    return null;

  const div = Status(`Error: ${text}`, true)
    .fadeOut(cfg.statusErrorFadeout);

  $('#status-container .flowing').prepend(div);

  setTimeout(() => div.detach(), cfg.statusErrorFadeout);
}

function update() {

  const parse = $('#parse-status')
    .removeClass('red green');

  const graph = $('#graph-status');

  if (manager.current.parsed) {

    parse
      .addClass('green')
      .text('auto');

  } else {

    parse
      .addClass('red')
      .text('off');

    graph
      .addClass('red')
      .text('blocked');

  }

  try {
    if (!cy.elements().length) {

      graph.text('uninitialized');
      return;
    }
  } catch (e) { }

  // set the status now that we're sure we have a graph
  if (cy.$('.splitting').length) {

    graph.text('splitting node');

  } else if (cy.$('.merge-source').length) {

    graph.text('merging tokens');

  } else if (cy.$('.combine-source').length) {

    graph.text('forming multiword token');

  } else if (!gui.editing) {

    graph.text('viewing');

  } else {

    graph.text('editing ' + gui.editing.data('name'));

  }
}

module.exports = {
  normal,
  error,
  update,
};
