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

  push(serial) {

    if (this.active)
      return false;

    // do some comparisons here to change for changes
    console.log(serial)
    console.log(this.current)
    //if (JSON.stringify(serial) === JSON.stringify(this.current))
      //return false;

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
    this.app.socket.broadcast('modify corpus', {
      type: 'undo',
      serial: undo,
    });
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
    this.app.socket.broadcast('modify corpus', {
      type: 'redo',
      serial: redo,
    });
    this.app.save();
    this.app.gui.refresh();
    this.active = false;

    return true;
  }
}


module.exports = UndoManager;
