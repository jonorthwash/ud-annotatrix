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

/**
 * Wrapper class to hold references to all of our actual client objects (e.g.
 *  CollaborationInterface, Corpus, GUI, Graph, Server, Socket, UndoManager).
 *  This class should be instantiated at the beginning of a session.
 */
 class App {
  constructor(args) {

    // console.log("oloo", args);
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
    this.online = args[0];
    this.initialized = false;
    this.undoer = new UndoManager(this);
    this.server = new Server(this);
    this.socket = new Socket(this);
    this.gui = new GUI(this);
    this.collab = new CollaborationInterface(this);
    this.corpus = new Corpus(this);
    this.graph = new Graph(this);
    this.initialized = true;

    console.log("mode:", this.online?"online":"offline");

    // jump to sentence from frag id
    setTimeout(() => {

      const hash = window.location.hash.substring(1);
      this.corpus.index = parseInt(hash) - 1;

    }, 500);
    if (this.online) { // only if the app was loaded from a server
      this.server.connect();
      this.socket.connect();
    }
    this.gui.refresh();

    if(!this.online) {
      let backup  = utils.storage.restore();

      if(!$.isEmptyObject(backup)) {
        console.log("backup", backup);
        this.corpus = new Corpus(this, backup);
      }
    }
  }

  /**
   * Save all current corpus- and meta-data, either to the server or to
   *  localStorage.
   */
  save(message) {

    if (!this.initialized || this.undoer.active)
      return;

    this.gui.status.normal('saving...');

    // save local preference stuff
    this.gui.save();
    this.graph.save();

    // serialize the corpus
    let serial = this.corpus.serialize();
    console.log("this.corpus.serialize", serial);
    // add it to the undo/redo stack if it's an actual change
    this.undoer.push(serial)

    if (message && this.online) {
      this.socket.broadcast('modify corpus', {
        type: message.type,
        indices: message.indices,
        serial: serial,
      });
    }

    // save it to server/local
    if (this.server.is_running) {
      this.server.save(serial);
    } else {
      utils.storage.save(serial);
    }

    // refresh the gui stuff
    this.gui.refresh();

  }

  /**
   * Load a corpus from a serial string.
   */
  load(serial) {

    //this.gui.status.normal('loading...')
    this.corpus = new Corpus(this, serial);
    this.gui.refresh();

  }

  /**
   * Load a fresh/new corpus and overwrite an existing one.
   */
  discard() {

    this.corpus = new Corpus(this);
    this.save();
    this.gui.menu.is_visible = false;
    this.gui.refresh();

  }

  /**
   * Download the contents of an application instance.
   */
  download() {

    const contents = this.corpus._corpus._sentences.map((sent, i) => {
      try {
        return sent.to(this.corpus.format).output;
      } catch (e) {
        console.error(e);
        return `[Unable to generate sentence #${i+1} in "${this.corpus.format}" format]`;
      }
    }).join('\n\n');

    utils.download(`${this.corpus.filename}.conll`, 'text/plain', contents);

  }
}


module.exports = App;
