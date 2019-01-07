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

      const gui = self.gui;
      gui.config.autoparsing = !gui.config.autoparsing;

      if (gui.config.autoparsing) {
        self.gui.app.corpus.parse($('#text-data').val());
      } else {
        self.gui.app.corpus.current.input = $('#text-data').val();
        self.gui.app.corpus.format = null;
      }

      gui.save();
      gui.refresh();
    });
  }

  refresh() {

    const corpus = this.gui.app.corpus,
      graph = this.gui.app.graph,
      gui = this.gui;

    $('#parse-status')
      .removeClass('red green')
      .addClass(gui.config.autoparsing ? 'green' : 'red')
      .text(gui.config.autoparsing ? 'on' : 'off');

    let graphStatus;
    if (!corpus.isParsed) {

      graphStatus = 'blocked';

    } else if (!graph.eles.length) {

      graphStatus = 'uninitialised';

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
      .addClass(corpus.isParsed ? 'green' : 'red')
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
