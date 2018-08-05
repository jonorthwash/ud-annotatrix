'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('../utils');

const config = require('./config');
const corpus = require('../corpus');
const graph = require('../graph');

const GraphMenu = require('./graph-menu');
const keys = require('./keyboard');
const Labeler = require('./labeler');
const Menu = require('./menu');
const modals = require('./modals');
const Table = require('./table');
const progressBar = require('./progress-bar');
const Status = require('./status');


class GUI {
  constructor(app) {

    this.app = app;

    // bind subelements
    // something about undo?
    this.config = config;
    this.graphMenu = new GraphMenu(this);
    this.keys = keys;
    this.labeler = new Labeler(this);
    this.menu = new Menu(this);
    this.progressBar = progressBar;
    this.status = new Status(this);
    this.table = new Table(this);

    this.bind();
  }

  save(...args) {

    console.log('save graph');

  }

  bind() {

    // ignore all this stuff if we're in Node
    if (!this.config.is_browser)
      return;

    const self = this;

    // bind the subelements
    require('./selfcomplete');
    this.graphMenu.bind();
    this.menu.bind();
    this.status.bind();

    // graph interception stuff
    $('.controls').click(e => $(':focus:not(#edit)').blur());
    $('#edit').click(e => { self.app.graph.intercepted = true; });

    // keystroke handling & such
    window.onkeyup = e => this.keys.up(self, e);
    window.onkeydown = e => this.keys.down(self, e);
    window.onbeforeunload = e => this.app.save();
  }

  refresh() {

    // ignore all this stuff if we're in node
    if (!this.config.is_browser)
      return;

    // refresh all subelements
    this.labeler.refresh();
    this.menu.refresh();
    this.progressBar.refresh();
    this.status.refresh();

    // show the data
    if (this.config.is_textarea_visible) {

      if (this.app.corpus.format !== 'CoNLL-U')
        this.config.is_table_visible = false;

      if (this.config.is_table_visible) {

        $('#table-data').show();
        $('#text-data').hide();
        this.gui.table.refresh();

      } else {

        $('#table-data').hide();
        $('#text-data')
          .val(this.app.corpus.textdata)
          .show();
      }
    }

    // and draw the graph
    this.app.graph.draw();
  }
}


module.exports = GUI;
