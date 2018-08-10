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
    this.gui = new GUI(this);
    this.collab = new CollaborationInterface(this);
    this.corpus = new Corpus(this);
    this.graph = new Graph(this);
    this.initialized = true;

    // jump to sentence from frag id
    setTimeout(() => {

      const hash = window.location.hash.substring(1);
      this.corpus.index = parseInt(hash) - 1;

    }, 500);

    this.server.connect();
    this.socket.connect();
    this.gui.refresh();

  }

  save(message) {

    if (!this.initialized || this.undoer.active)
      return;

    this.gui.status.normal('saving...');

    // save local preference stuff
    this.gui.save();
    this.graph.save();

    // serialize the corpus
    let serial = this.corpus.serialize();

    // add it to the undo/redo stack if it's an actual change
    this.undoer.push(serial)

    if (message)
      this.socket.broadcast('modify corpus', {
        type: message.type,
        indices: message.indices,
        serial: serial,
      });

    // save it to server/local
    if (this.server.is_running) {
      this.server.save(serial);
    } else {
      utils.storage.save(serial);
    }

    // refresh the gui stuff
    this.gui.refresh();

  }

  load(serial) {

    //this.gui.status.normal('loading...')
    this.corpus = new Corpus(this, serial);
    this.gui.refresh();

  }

  discard() {

    this.corpus = new Corpus(this);
    this.save();
    this.gui.menu.is_visible = false;
    this.gui.refresh();

  }

  download() {

    const contents = this.corpus._corpus._sentences.map((sent, i) => {
      try {
        return sent.to(this.corpus.format).output;
      } catch (e) {
        console.error(e);
        return `[Unable to generate sentence #${i+1} in "${this.corpus.format}" format]`;
      }
    }).join('\n\n');

    utils.download(`${this.corpus.filename}.corpus`, 'text/plain', contents);

  }
}


module.exports = App;
