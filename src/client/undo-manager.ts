import * as nx from "./notatrix";
import {Corpus} from "./corpus";
import {storage} from "./utils";
import type {App} from "./app";

class Stack<T> {
  private _items: T[];
  constructor() { this._items = []; }

  get length() { return this._items.length; }

  push(item: T) { this._items.push(item); }

  pop() { return this._items.pop() }

  peek() { return this._items.slice(-1)[0]; }

  clear() { this._items = []; }
}

export class UndoManager {
  private app: App;
  public active: boolean;
  public current: any|null;
  private undoStack: Stack<nx.CorpusSerial>;
  private redoStack: Stack<nx.CorpusSerial>;

  constructor(app: App) {
    this.app = app;
    this.active = false;
    this.current = null;
    this.undoStack = new Stack();
    this.redoStack = new Stack();
  }

  hasUndo() { return !!this.undoStack.length; }

  hasRedo() { return !!this.redoStack.length; }

  push(serial: any) {

    if (this.active)
      return false;

    // do some comparisons here to change for changes
    console.log("serial", serial) // updated
    storage.backup(serial);
    console
        .log("current", this.current)
        // if (JSON.stringify(serial) === JSON.stringify(this.current))
        // return false;

        this.undoStack.push(this.current);
    this.redoStack.clear();
    this.current = serial;

    return true;
  }

  undo() {

    if (!this.hasUndo())
      return false;

    this.active = true;
    let current = this.app.corpus.serialize();
    this.redoStack.push(this.current);
    this.current = current;

    let undo = this.undoStack.pop();
    this.app.corpus = new Corpus(this.app, undo);
//    this.app.socket.broadcast("modify corpus", {
//      type: "undo",
//      serial: undo,
//    });
    this.app.save();
    this.app.gui.refresh();
    this.active = false;

    return true;
  }

  redo() {

    if (!this.hasRedo())
      return false;

    this.active = true;
    let current = this.app.corpus.serialize();
    this.undoStack.push(this.current);
    this.current = current;

    let redo = this.redoStack.pop();
    this.app.corpus = new Corpus(this.app, redo);
//    this.app.socket.broadcast("modify corpus", {
//      type: "redo",
//      serial: redo,
//    });
    this.app.save();
    this.app.gui.refresh();
    this.active = false;

    return true;
  }
}
