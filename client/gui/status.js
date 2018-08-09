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

      const corpus = self.gui.app.corpus;

      if (corpus.parsed) {

        corpus.unparsed = $('#text-data').val();
        self.gui.refresh();

      } else {

        corpus.parse(corpus.unparsed);

      }
    });
  }

  refresh() {

    const corpus = this.gui.app.corpus,
      graph = this.gui.app.graph;

    $('#parse-status')
      .removeClass('red green')
      .toggleClass(corpus.parsed ? 'green' : 'red')
      .text(corpus.parsed ? 'auto' : 'off');

    let graphStatus;
    if (!corpus.parsed) {

      graphStatus = 'blocked';

    } else if (!graph.eles.length) {

      graphStatus = 'uninitialized';

    } else if (graph.cy.$('.splitting').length) {

      graphStatus = 'splitting node';

    } else if (graph.cy.$('.merge-source').length) {

      graphStatus = 'merging tokens';

    } else if (graph.cy.$('.combine-source').length) {

      graphStatus = 'forming multiword token';

    } else if (graph.editing) {

      graphStatus = 'editing ' + graph.editing.data('name');

    } else {

      graphStatus = 'viewing';

    }

    $('#graph-status')
      .removeClass('red green')
      .toggleClass('red', !corpus.parsed)
      .toggleClass('green', corpus.parsed)
      .text(graphStatus);

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
