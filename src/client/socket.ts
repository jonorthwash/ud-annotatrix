// @ts-ignore: We don't have access to SocketIO types unless we upgrade to v3 :^)
import * as _Socket from "socket.io-client";

interface SocketIoClient {
  on(channel: string, callback: (data: any) => void): void;
  emit(channel: string, data: any): void;
}

import {check_if_browser} from "./utils/funcs";
import type {App} from "./app";

/**
 * Abstraction over a SocketIO connection.  Handles sending and receiving small
 *  packets from a server.
 *
 * NB: this handles all server communication except for the (de)serialization of
 *  the corpus (this is handled via AJAX calls).
 */
export class Socket {
  private app: App;
  private _socket: SocketIoClient|null;
  public initialized: boolean;
  private isOpen: boolean;

  constructor(app: App) {
    this.app = app;

    // save some internal state to avoid loops and errors
    this._socket = null;
    this.initialized = false;
    this.isOpen = false;
  }

  /**
   * Make a connection to the server and set callbacks for the various messages
   *  we expect to receive.
   */
  connect() {

    // we shouldn't try to connect if we're just testing
    if (!check_if_browser() || !this.app.online)
      return;

    // cache this access
    const collab = this.app.collab, corpus = this.app.corpus, graph = this.app.graph, gui = this.app.gui;

    // request a server connection
    this._socket = new _Socket() as SocketIoClient;

    // handle server approving our request for connection
    this._socket.on("initialization", data => {
      // internals
      this.initialized = true;
      this.isOpen = true;

      // make a note of our id, name, etc
      collab.setSelf(data);
    });

    // another user connected to the document
    this._socket.on("connection", d => collab.addUser(d));

    // a user diconnected from the document
    this._socket.on("disconnection", d => collab.removeUser(d));

    // a user modified the corpus
    this._socket.on("modify corpus", data => {
      const user = collab.getUser(data.id);

      let index = corpus.index;

      // check whether we need to change our corpus index
      switch (data.type) {
      case ("insert"):
        if (data.indices[0] <= index)
          index++;
        break;

      case ("remove"):
        if (data.indices[0] < index)
          index--;
        break;

      case ("redo"):
      case ("undo"):
        index = data.serial.index;
        break;

      case ("set"):
        break;

      case ("parse"):
        if (data.indices[0] < index)
          index += data.indices.length - 1;
        break;
      }

      // send a chat alert
      gui.chat.alert(`%u: '${data.type}' index ${data.indices[0]}`, [user]);

      // update the undo stack
      this.app.undoer.push(data.serial);

      // save the current index
      const currentIndex = this.app.corpus.index;

      // load the newest serialization
      this.app.load(data.serial);

      // navigate to the correct index
      this.app.corpus.index = currentIndex;
    });

    // a user modified their current index
    this._socket.on("modify index", data => {
      const user = collab.getUser(data.id);
      user.viewing = data.index;
      gui.chat.updateUser(user);
    });

    // a user clicked on a graph node
    this._socket.on("lock graph", data => {
      const user = collab.getUser(data.id);
      user.locked = data.locked;
      graph.setLocks();
    });

    // a user clicked off of a graph node
    this._socket.on("unlock graph", data => {
      const user = collab.getUser(data.id);
      user.locked = data.locked;
      graph.setLocks();
    });

    // a user moved their mouse in the graph area
    this._socket.on("move mouse", data => {
      const user = collab.getUser(data.id);
      user.mouse = data.mouse;
      graph.drawMice();
    });

    // a user sent a chat message
    this._socket.on("new message", data => {
      const user = collab.getUser(data.id);
      gui.chat.newMessage(user, data.message, false);
    });
  }

  /**
   * Broadcast (/emit) a packet of type <name> with arguments <data> to the server.
   */
  broadcast(name: string, data?: any) {

    // debugging
    // console.log('broadcast', name, data);

    // do the work
    this._socket.emit(name, data);
  }
}
