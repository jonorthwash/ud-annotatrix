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
const UndoManager = require('./undo-manager');

class App {
  constructor() {

    this.config = config;
    this.constructors = {

      CollaborationInterface,
      Corpus,
      Graph,
      GUI,
      nx,
      Server,
      Socket,
      UndoManager,

    };

    this.initialized = false;
    this.undoer = new UndoManager(this);
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

    if (!this.initialized || this.undoer.active)
      return;

    this.gui.status.normal('saving...');

    // save local preference stuff
    this.gui.save();
    this.graph.save();

    // save the treebank
    let serial = this.corpus.serialize();
    serial = JSON.stringify(serial);
    if (this.server.is_running) {
      this.server.save(serial);
    } else {
      utils.storage.save(serial);
    }

    // add it to the undo/redo stack
    this.undoer.push();

    // refresh the gui stuff
    this.gui.refresh();
    /*
    if (broadcast)
      this.app.socket.broadcast({
        type: 'remove-sentence',
        index: this.index,
        sent: sent,
      });*/
  }

  load(serial) {

    this.gui.status.normal('loading...')

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
