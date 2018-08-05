'use strict';

const _ = require('underscore');
const $ = require('jquery');


class GraphMenu {
  constructor(gui) {

    this.gui = gui;

  }

  bind() {

    const corpus = this.gui.app.corpus,
      self = this;

    $('#LTR').click(e => {

      corpus._meta.is_ltr = !corpus._meta.is_ltr;
      self.gui,app.save();
      self.gui.refresh();

    });

    $('#vertical').click(e => {

      corpus._meta.is_vertical = !corpus._meta.is_vertical;
      self.gui.app.save();
      self.gui.refresh();

    });

    $('#enhanced').click(e => {

      if (corpus.current.options.enhanced) {
        corpus.current.unenhance();
      } else {
        corpus.current.enhance();
      }

      self.gui.app.save();
      self.gui.refresh();
    });
  }

  refresh() {

    const corpus = this.gui.app.corpus;

    $('#LTR .fa')
      .removeClass('fa-align-left fa-align-right')
      .addClass(corpus._meta.is_ltr ? 'fa-align-left' : 'fa-align-right');

    $('#vertical .fa')
      .toggleClass('fa-rotate-90', corpus._meta.is_vertical);

    $('#enhanced')
      .removeClass('fa-tree fa-magic')
      .addClass(corpus.current.options.enhanced ? 'fa-magic' : 'fa-tree');

  }
}


module.exports = GraphMenu;
