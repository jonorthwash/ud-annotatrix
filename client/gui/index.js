'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('../utils');

const config = require('./config');
const corpus = require('../corpus');
const graph = require('../graph');

const Chat = require('./chat');
const GraphMenu = require('./graph-menu');
const keys = require('./keyboard');
const Labeler = require('./labeler');
const Menu = require('./menu');
const modalFactory = require('./modals');
const Table = require('./table');
const Status = require('./status');


class GUI {
  constructor(app) {

    this.app = app;

    // bind subelements
    // something about undo?
    this.chat = new Chat(this);
    this.config = config;
    this.graphMenu = new GraphMenu(this);
    this.keys = keys;
    this.labeler = new Labeler(this);
    this.menu = new Menu(this);
    this.modals = modalFactory(this);
    this.status = new Status(this);
    this.table = new Table(this);

    this.load();
    this.bind();
  }

  save() {

    let serial = _.pick(this.config
      , 'column_visibilities'
      , 'is_label_bar_visible'
      , 'is_table_visible'
      , 'is_textarea_visible'
      , 'pinned_menu_items'
      , 'textarea_height' );
    serial = JSON.stringify(serial);
    utils.storage.setPrefs('gui', serial);

  }

  load() {

    let serial = utils.storage.getPrefs('gui');
    serial = JSON.parse(serial);

    this.config.set(serial);
    if (serial && serial.pinned_menu_items)
      serial.pinned_menu_items = new Set(serial.pinned_menu_items);

  }

  bind() {

    // ignore all this stuff if we're in Node
    if (!this.config.is_browser)
      return;

    const self = this;

    // bind the subelements
    require('./selfcomplete');
    this.chat.bind();
    this.graphMenu.bind();
    this.menu.bind();
    this.status.bind();

    // graph interception stuff
    $('.controls').click(e => $(':focus:not(#edit)').blur());
    $('#edit').click(e => { self.app.graph.intercepted = true; });

    // keystroke handling & such
    window.onkeyup = e => self.keys.up(self.app, e);
    window.onkeydown = e => self.keys.down(self.app, e);
    //window.onbeforeunload = e => self.app.save();

    // textarea resizing

    $('#text-data').mouseup(e => {

      config.textarea_height = $(e.target).css('height');
      self.app.graph.draw();
      self.save();

    });

  }

  refresh() {

    // ignore all this stuff if we're in node
    if (!this.config.is_browser)
      return;

    const corpus = this.app.corpus;

    // refresh all subelements
    this.chat.refresh();
    this.graphMenu.refresh();
    this.labeler.refresh();
    this.menu.refresh();
    this.status.refresh();

    // show the data
    if (this.config.is_textarea_visible) {

      if (corpus.format !== 'CoNLL-U')
        this.config.is_table_visible = false;

      if (this.config.is_table_visible) {

        $('#table-data').show();
        $('#text-data').hide();
        this.table.rebuild();

      } else {

        $('#table-data').hide();
        $('#text-data')
          .val(corpus.textdata)
          .css('height', config.textarea_height)
          .show();
      }
    }

    // show our warnings
    $('.tab-warning').hide();
    if (corpus.conversionLosses.length)
      $(`.format-tab[name="${corpus.format}"] .tab-warning`)
        .show()
        .attr('title', `Unable to encode ${corpus.conversionLosses.join(', ')}`);

    // show our errors
    $('.tab-error').hide();
    _.each(corpus.conversionErrors, (message, format) => {
      $(`.format-tab[name="${format}"]`)
        .addClass('disabled')
        .find(`.tab-error`)
          .show()
          .attr('title', message);
    });

    // and draw the graph
    this.app.graph.draw();

    // show the completeness
    const percent = 100 * (this.app.graph.progress.total
      ? this.app.graph.progress.done / this.app.graph.progress.total
      : 0);

    $('#progress-bar')
      .css('width', `${percent}%`);

  }
}


module.exports = GUI;