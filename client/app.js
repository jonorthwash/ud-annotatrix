'use strict';

const _ = require('underscore');
const utils = require('./utils');
const nx = require('notatrix');

const CollaborationInterface = require('./collaboration');
const config = require('./config');
const Corpus = require('./corpus');
const Graph = require('./graph');
const GUI = require('./gui');
const Server = require('./server');
const Socket = require('./socket');


class App {
  constructor() {

    this.nx = nx;

    this.initialized = false;
    this.server = new Server(this);
    this.socket = new Socket(this);
    this.collab = new CollaborationInterface(this);
    this.gui = new GUI(this);
    this.corpus = new Corpus(this);
    this.graph = new Graph(this);
    this.initialized = true;

    this.gui.refresh();
    this.server.connect();

  }

  save() {

    if (!this.initialized)
      return;

    // save local preference stuff
    this.gui.save();
    this.graph.save();

    // save the treebank
    let serial = this.corpus.serialize();
    serial = JSON.stringify(serial);
    if (this.server.is_running) {
      this.server.save(serial)
    } else {
      utils.storage.save(serial);
    }

    console.log('saved');
  }

  load(serial) {

    serial = JSON.parse(serial);
    this.corpus = new Corpus(this, serial);
    this.gui.refresh();

  }

  discard() {

    console.log('discard');

  }

  download() {

    console.log('download');

  }
}


module.exports = App;
