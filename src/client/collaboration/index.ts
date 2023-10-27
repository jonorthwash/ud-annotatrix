import * as _ from "underscore";

import {thin} from "../utils/funcs";
import type {App} from "../app";
import type {Chat} from "../gui/chat";
import {MousePosition, User, UserData} from "./user";

export interface SetSelfData extends UserData {
  room: {users: UserData[]};
}

export interface MouseNode {
  id: string;
  position: MousePosition;
  color: string;
}

/**
 * Abstraction to help with handling multiple users collaborating on a document.
 *  This module takes care of maintaining:
 *  - the current user
 *  - a list of all current users on this document
 *  - methods for getting the mice and locks for those users
 */
export class CollaborationInterface {
  private app: App;
  public self: User|null;
  private chat: Chat;
  private _users: {[id: string]: User};

  constructor(app: App) {

    this.app = app;

    // pointer to data about the current user
    this.self = null;

    // cache a pointer to the chat (since we use it often)
    this.chat = app.gui.chat;

    // a list of users on this document
    this._users = {};
  }

  /**
   * Return the number of online users.
   */
  get size() { return Object.keys(this._users).length; }

  /**
   * Save data about the current user.  This method is called after we establish
   *  a connection with our socket server.
   */
  setSelf(data: SetSelfData) {

    // make a User object from the data
    const self = new User(data);
    self.name = self.name === "anonymous" ? "me" : self.name;

    // don't overwrite if already set
    if (JSON.stringify(self) === JSON.stringify(this.self))
      return;

    // iterate over all the users in the room and add them (this way, even
    //  connections that aren't the first will have an accurate list)
    _.each(data.room.users, user => { this.addUser(user, user.id !== self.id); });

    // save the reference
    this.self = self;

    // log it to the chat
    this.chat.alert(`you are logged in as %u`, [self]);

    // draw the mice and locks for everyone in the room
    this.app.graph.drawMice();
    this.app.graph.setLocks();
  }

  /**
   * Get a User object by <id>.
   */
  getUser(id: string) { return this._users[id]; }

  /**
   * Add a User to our list.
   */
  addUser(data: UserData, notifyChat: boolean = true) {

    const user = new User(data);
    this._users[data.id] = user;

    if (notifyChat)
      this.chat.alert(`%u connected from ${user.ip}`, [user]);

    this.chat.refresh();
  }

  /**
   * Remove a User from our list.
   */
  removeUser(data: UserData, notifyChat: boolean = true) {

    const user = this.getUser(data.id);
    delete this._users[data.id];

    if (alert)
      this.chat.alert(`%u disconnected from ${user.ip}`, [user]);

    this.chat.refresh();
  }

  /**
   * Get a list of mouse nodes (each with a user id, position (x & y coords), and
   *  hex color code), at most one per user.  Mice are only shown for users on
   *  the same page (i.e. same corpus index) as this.self.
   */
  getMouseNodes(): MouseNode[] {

    // map over the users
    return _
        .map(this._users,
             user => {
               // if not self and on same index
               if (user.id !== this.self.id && user._viewing === this.app.corpus.index)

                 // return some info
                 return {
                   id: user.id,
                   position: user.mouse,
                   color: user.color,
                 };

               // filter out things that didn't match our condition
               return null;
             })
        .filter(thin);
  }

  /**
   * Get a list of node locks (each with a user id, cytoscape selector, and
   *  hex color code), at most one per user.  Locks are only shown for users on
   *  the same page (i.e. same corpus index) as this.self.
   */
  getLocks() {

    // map over the users
    return _
        .map(this._users,
             user => {
               // if not self and on same index and locking something
               if (user.id !== this.self.id && user._viewing === this.app.corpus.index && user.locked)

                 // return some info
                 return {
                   id: user.id,
                   locked: user.locked,
                   color: user.color,
                 };

               // filter out things that didn't match our condition
               return null;
             })
        .filter(thin);
  }
}
