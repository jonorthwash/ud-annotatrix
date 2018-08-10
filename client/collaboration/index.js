'use strict';

const _ = require('underscore');
const utils = require('../utils');

const User = require('./user');


class CollaborationInterface {
  constructor(app) {

    this.app = app;
    this.self = null;
    this.chat = app.gui.chat;
    this._users = {};

  }

  get size() {
    return Object.keys(this._users).length;
  }

  setSelf(data) {

    const self = new User(data);
    self.name = self.name === 'anonymous' ? 'me' : self.name;

    if (JSON.stringify(self) === JSON.stringify(this.self))
      return;

    _.each(data.room.users, user => {
      this.addUser(user, user.id !== self.id);
    });

    this.self = self;
    this.chat.alert(`you are logged in as %u`, [self]);
    this.app.graph.drawMice(this.getMouseNodes());
    this.app.graph.setLocks(this.getLocks());

  }

  addUser(data, alert=true) {

    const user = new User(data);
    this._users[data.id] = user;

    if (alert)
      this.chat.alert(`%u connected from ${user.ip}`, [user]);

    this.chat.refresh();
  }

  removeUser(data, alert=true) {

    const user = this._users[data.id];
    if (!user)
      return;

    delete this._users[data.id];

    if (alert)
      this.chat.alert(`%u disconnected from ${user.ip}`, [user]);

    this.chat.refresh();
  }

  onModify(data, alert=true) {

    const user = this._users[data.id];

    let index = this.app.corpus.index;
    switch (data.type) {
      case ('insert'):
        if (data.indices[0] <= index)
          index++;
        break;

      case ('remove'):
        if (data.indices[0] < index)
          index--;
        break;

      case ('redo'):
      case ('undo'):
        index = data.serial.index;
        break;

      case ('set'):
        break;

      case ('parse'):
        if (data.indices[0] < index)
          index += data.indices.length - 1;
        break;
    }

    if (alert)
      this.app.gui.status.normal(`%u modified the corpus`, [user]);

    this.app.undoer.push(data.serial);
    this.app.load(data.serial);
    this.app.corpus.index = index;
  }

  sendMessage(message) {

    this.app.socket.broadcast('new message', {
      id: this.self.id,
      message: message,
    });
    this.chat.newMessage(this.self, message, true);

  }

  onMessage(data) {

    const user = this._users[data.id];
    this.chat.newMessage(user, data.message, false);

  }

  onModifyIndex(data) {

    const user = this._users[data.id];
    user.viewing = data.index;

    this.chat.updateUser(user);

  }

  getMouseNodes() {
    return _.map(this._users, user => {

      if (user.id !== this.self.id && user._viewing === this.app.corpus.index)
        return {
          id: user.id,
          position: user.mouse,
          color: user.color,
        };

    }).filter(utils.thin);
  }

  onMoveMouse(data) {

    console.log(data);
    const user = this._users[data.id];
    user.mouse = data.mouse;

    this.app.graph.drawMice(this.getMouseNodes());
  }

  getLocks() {
    return _.map(this._users, user => {

      if (user.id !== this.self.id
        && user._viewing === this.app.corpus.index
        && user.locked)

        return {
          id: user.id,
          locked: user.locked,
          color: user.color,
        };

    }).filter(utils.thin);
  }

  onLock(data) {

    console.log(data);
    const user = this._users[data.id];
    user.locked = data.locked;

    this.app.graph.setLocks(this.getLocks());
  }

  onUnlock(data) {

    console.log(data);
    const user = this._users[data.id];
    user.locked = data.locked;

    this.app.graph.setLocks(this.getLocks());
  }
}


module.exports = CollaborationInterface;
