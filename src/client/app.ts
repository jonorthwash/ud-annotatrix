import * as $ from "jquery";

import * as nx from "../notatrix";
import {storage} from "./utils";
import {download} from "./utils/funcs";

import {_config as config} from "./config";
import {Corpus} from "./corpus";
import {Graph} from "./graph";
import {GUI} from "./gui";
//import {Server} from "./server";
import {Socket} from "./socket";
import {UndoManager} from "./undo-manager";

interface SaveMessage {
  type: unknown;
  indices: unknown;
}

/**
 * Wrapper class to hold references to all of our actual client objects (e.g.
 *  CollaborationInterface, Corpus, GUI, Graph, Server, Socket, UndoManager).
 *  This class should be instantiated at the beginning of a session.
 */
export class App {
  private config: typeof config;
  public online: boolean;
  public initialized: boolean;
  public undoer: UndoManager;
  //public server: Server;
  public socket: Socket;
  public gui: GUI;
  //public collab: CollaborationInterface;
  public corpus: Corpus;
  public graph: Graph;

  constructor(online: boolean) {

    this.config = config;
    this.online = online;
    this.initialized = false;
    this.undoer = new UndoManager(this);
    //this.server = new Server(this);
    this.socket = new Socket(this);
    this.gui = new GUI(this);
    //this.collab = new CollaborationInterface(this);
    this.corpus = new Corpus(this);
    this.graph = new Graph(this);
    this.initialized = true;

    console.log("mode:", this.online ? "online" : "offline");

    // jump to sentence from frag id
    setTimeout(() => {
      const hash = window.location.hash.substring(1);
      this.corpus.index = parseInt(hash) - 1;
    }, 500);
//    if (this.online) {
//      this.server.connect();
//      this.socket.connect();
//    } else {
      let backup = storage.restore();
      if (!$.isEmptyObject(backup)) {
        console.log("backup", backup);
        this.corpus = new Corpus(this, backup);
      }
//    }
    this.gui.refresh();
  }

  /**
   * Save all current corpus- and meta-data, either to the server or to
   *  localStorage.
   */
  save(message?: SaveMessage) {

    if (!this.initialized || this.undoer.active)
      return;

    this.gui.status.normal("saving...");

    // save local preference stuff
    this.gui.save();
    this.graph.save();

    // serialize the corpus
    let serial = this.corpus.serialize();
    console.log("this.corpus.serialize", serial);
    // add it to the undo/redo stack if it's an actual change
    this.undoer.push(serial)

    if (message && this.online) {
      this.socket.broadcast("modify corpus", {
        type: message.type,
        indices: message.indices,
        serial: serial,
      });
    }

    // save it to server/local
//    if (this.server.is_running) {
//      this.server.save(serial);
//    } else {
      storage.save(serial);
//    }

    // refresh the gui stuff
    this.gui.refresh();
  }

  /**
   * Load a corpus from a serial string.
   */
  load(serial: nx.CorpusSerial) {
    // this.gui.status.normal('loading...')
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

    const contents = this.corpus._corpus._sentences
                         .map((sent, i) => {
                           try {
                             const format = this.corpus.format || "plain text";
                             return sent.to(format).output;
                           } catch (e) {
                             console.error(e);
                             return `[Unable to generate sentence #${i + 1} in "${this.corpus.format}" format]`;
                           }
                         })
                         .join("\n\n");

    download(`${this.corpus.filename}.conllu`, "text/plain", contents);
  }
}
