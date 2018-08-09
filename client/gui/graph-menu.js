'use strict';

const _ = require('underscore');
const $ = require('jquery');


class GraphMenu {
  constructor(gui) {

    this.gui = gui;

  }

  bind() {

    const self = this;

    $('#LTR').click(e => {

      const corpus = self.gui.app.corpus;

      corpus.is_ltr = !corpus.is_ltr;
      self.gui.app.save({
        type: 'set',
        indices: [corpus.index],
      });
      self.gui.refresh();

    });

    $('#vertical').click(e => {

      const corpus = self.gui.app.corpus;

      corpus.is_vertical = !corpus.is_vertical;
      self.gui.app.save({
        type: 'set',
        indices: [corpus.index],
      });
      self.gui.refresh();

    });

    $('#enhanced').click(e => {

      const corpus = self.gui.app.corpus;

      if (corpus.is_enhanced) {
        corpus.current.unenhance();
      } else {
        corpus.current.enhance();
      }

      self.gui.app.save({
        type: 'set',
        indices: [corpus.index],
      });
      self.gui.refresh();
    });
  }

  refresh() {

    const corpus = this.gui.app.corpus;

    $('#LTR .fa')
      .removeClass('fa-align-left fa-align-right')
      .addClass(corpus.is_ltr ? 'fa-align-left' : 'fa-align-right');

    $('#vertical .fa')
      .toggleClass('fa-rotate-90', corpus.is_vertical);

    $('#enhanced .fa')
      .removeClass('fa-tree fa-magic')
      .addClass(corpus.is_enhanced ? 'fa-magic' : 'fa-tree');

  }
}


module.exports = GraphMenu;
