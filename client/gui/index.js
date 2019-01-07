'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('../utils');
const Chat = require('./chat');
const config = require('./config');
const corpus = require('../corpus');
const GraphMenu = require('./graph-menu');
const keys = require('./keyboard');
const Labeler = require('./labeler');
const Menu = require('./menu');
const modalFactory = require('./modals');
const Status = require('./status');
const Table = require('./table');
const Textarea = require('./textarea');


class GUI {
  constructor(app) {

    this.app = app;

    // bind subelements
    this.chat = new Chat(this);
    this.config = config;
    this.graphMenu = new GraphMenu(this);
    this.keys = keys;
    this.labeler = new Labeler(this);
    this.menu = new Menu(this);
    this.modals = modalFactory(this);
    this.status = new Status(this);
    this.table = new Table(this);
    this.textarea = new Textarea(this);

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
      , 'textarea_height'
      , 'autoparsing' );
    serial = JSON.stringify(serial);
    utils.storage.setPrefs('gui', serial);

  }

  load() {

    let serial = utils.storage.getPrefs('gui');
    if (!serial)
        return;

    serial = JSON.parse(serial);
    serial.pinned_menu_items = new Set(serial.pinned_menu_items || []);

    this.config.set(serial);

  }

  bind() {

    // ignore all this stuff if we're in Node
    if (!this.config.is_browser)
      return;

    const self = this;

    // bind all subelements
    require('./selfcomplete');
    this.chat.bind();
    this.graphMenu.bind();
    this.menu.bind();
    this.status.bind();
    this.textarea.bind();

    // graph interception stuff
    $('.controls').click(e => $(':focus:not(#edit)').blur());
    $('#edit').click(e => { self.app.graph.intercepted = true; });

    // keystroke handling & such
    window.onkeyup = e => self.keys.up(self.app, e);
    window.onkeydown = e => self.keys.down(self.app, e);
    window.onbeforeunload = e => self.app.save();

  }

  refresh() {

    // ignore all this stuff if we're in node
    if (!this.config.is_browser)
      return;

    // refresh all subelements
    this.chat.refresh();
    this.graphMenu.refresh();
    this.labeler.refresh();
    this.menu.refresh();
    this.status.refresh();
    this.textarea.refresh();

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
