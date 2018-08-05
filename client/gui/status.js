'use strict';

const $ = require('jquery');


class Status {
  constructor(gui) {

    this.gui = gui;

  }

  bind() {

    const self = this;

    // turn off autoparsing
    $('#parse-status').click(e => {
      if (self.gui.app.corpus.parsed) {

        self.gui.app.corpus.current._meta.unparsed = $('#text-data').val();
        self.gui.refresh();

      } else {

        self.gui.app.corpus.parse(self.gui.app.corpus.current._meta.unparsed);

      }
    });
  }

  refresh() {

    const corpus = this.gui.app.corpus;

    $('#parse-status')
      .removeClass('red green')
      .toggleClass(corpus.parsed ? 'green' : 'red')
      .text(corpus.parsed ? 'auto' : 'off');

    $('#graph-status')
      .toggleClass('red', !corpus.parsed)
      .text(this.gui.app.graph.status);

    /*
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
    */
  }

  normal(message) {

    const config = this.gui.config;

    if (!config.is_browser)
      return;

    const div = $('<div>')
      .addClass('status normal')
      .text(message)
      .fadeOut(config.statusNormalFadeout);

    $('#status-container .flowing').prepend(div);

    setTimeout(() => div.detach(), config.statusNormalFadeout);
  }

  error(message) {

    const config = this.gui.config;

    if (!config.is_browser)
      return;

    const div = $('<div>')
      .addClass('status error')
      .text(`Error: ${message}`)
      .fadeOut(config.statusErrorFadeout);

    $('#status-container .flowing').prepend(div);

    setTimeout(() => div.detach(), config.statusErrorFadeout);
  }
}


module.exports = Status;
