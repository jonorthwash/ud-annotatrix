'use strict';

const Corpus = require('./corpus')

class Stack {
  constructor() {
    this._items = [];
  }

  get length() {
    return this._items.length;
  }

  push(item) {
    this._items.push(item);
  }

  pop() {
    return this._items.pop()
  }

  peek() {
    return this._items.slice(-1)[0];
  }

  clear() {
    this._items = [];
  }
}

class UndoManager {
  constructor(app) {

    this.app = app;
    this.active = false;
    this.current = null;
    this.reset();

  }

  reset() {

    this.undoStack = new Stack();
    this.redoStack = new Stack();

  }

  hasUndo() {
    return !!this.undoStack.length;
  }

  hasRedo() {
    return !!this.redoStack.length;
  }

  push() {

    if (this.active)
      return;

    const serial = this.app.corpus.serialize();

    // do some comparisons here
    if (JSON.stringify(serial) === JSON.stringify(this.current))
      return;

    this.undoStack.push(this.current);
    this.redoStack.clear();
    this.current = serial;

  }

  undo() {

    if (!this.hasUndo())
      return false;

    this.active = true;
    let currentSerial = this.app.corpus.serialize();
    this.redoStack.push(this.current);
    this.current = currentSerial;

    let undoSerial = this.undoStack.pop();
    this.app.corpus = new Corpus(this.app, undoSerial);
    this.app.gui.refresh();
    this.active = false;

    this.app.save();
    return true;
  }

  redo() {

    if (!this.hasRedo())
      return false;

    this.active = true;
    let currentSerial = this.app.corpus.serialize();
    this.undoStack.push(this.current);
    this.current = currentSerial;

    let redoSerial = this.redoStack.pop();
    this.app.corpus = new Corpus(this.app, redoSerial);
    this.app.gui.refresh();
    this.app.save();
    this.active = false;

    return true;
  }
}


module.exports = UndoManager;
