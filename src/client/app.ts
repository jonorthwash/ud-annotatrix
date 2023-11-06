import * as $ from "jquery";

import * as nx from "./notatrix";
import {storage} from "./utils";
import {download} from "./utils/funcs";

import {_config as config} from "./config";
import {Corpus} from "./corpus";
import {Graph} from "./graph";
import {GUI} from "./gui";
import {UndoManager} from "./undo-manager";

interface SaveMessage {
  type: unknown;
  indices: unknown;
}

/**
 * Wrapper class to hold references to all of our actual client objects (e.g.
 *  Corpus, GUI, Graph, UndoManager).
 *  This class should be instantiated at the beginning of a session.
 */
export class App {
  private config: typeof config;
  public online: boolean;
  public initialized: boolean;
  public undoer: UndoManager;
  public gui: GUI;
  public corpus: Corpus;
  public graph: Graph;
  public embedded: boolean;

  constructor(online: boolean) {

    this.config = config;
    this.online = online;
    this.initialized = false;
    this.undoer = new UndoManager(this);
    this.gui = new GUI(this);
    this.corpus = new Corpus(this);
    this.graph = new Graph(this);
    this.initialized = true;
    this.embedded = false;

    console.log("mode:", this.online ? "online" : "offline");

    // jump to sentence from frag id
    setTimeout(() => {
      const hash = window.location.hash.substring(1);
      this.corpus.index = parseInt(hash) - 1;
    }, 500);
    let backup = storage.restore();
    if (!$.isEmptyObject(backup)) {
      console.log("backup", backup);
      this.corpus = new Corpus(this, backup);
    }
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

    // embedded
    if(window.top != window) {
      // for embedded use, the origin is '*'
      const contents = this.corpus._corpus._sentences
                           .map((sent, i) => {
                             try {
                               const format = this.corpus.format;
                               return sent.to(format).output;
                             } catch (e) {
                               console.error(e);
                               return `[Unable to generate sentence #${i + 1} in "${this.corpus.format}" format]`;
                             }
                           })
                           .join("\n\n");

      window.top.postMessage({message: "changed", conllu: contents.trim() + '\n'}, '*');
    }

    // save local preference stuff
    this.gui.save();
    this.graph.save();

    // serialize the corpus
    let serial = this.corpus.serialize();
    console.log("this.corpus.serialize", serial);
    // add it to the undo/redo stack if it's an actual change
    this.undoer.push(serial)

    storage.save(serial);

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
