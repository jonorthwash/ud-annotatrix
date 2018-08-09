'use strict';

const _ = require('underscore');
const utils = require('./utils');
const _Socket = require('socket.io-client');


class Socket {
  constructor(app) {

    this.app = app;
    this._socket = null;
    this.initialized = false;
    this.isOpen = false;

  }

  connect() {
    if (!utils.check_if_browser())
      return;

    const collab = this.app.collab;

    this._socket = new _Socket();

    this._socket.on('initialization', data => {

      this.initialized = true;
      this.isOpen = true;
      collab.setSelf(data);

    });

    this._socket.on('connection', d => collab.addUser(d));
    this._socket.on('disconnection', d => collab.removeUser(d));

    this._socket.on('modify corpus', d => collab.onModify(d));
    this._socket.on('modify index', d => collab.onModifyIndex(d));
    this._socket.on('lock graph', d => collab.onLock(d));
    this._socket.on('unlock graph', d => collab.onUnlock(d));
    this._socket.on('move mouse', d => collab.onMoveMouse(d));
    this._socket.on('new message', d => collab.onMessage(d));
  }

  broadcast(name, data) {

    console.log('broadcast', name, data);
    this._socket.emit(name, data);
  }

  on(...args) {
    console.log('socket on', ...args);
  }

  unlink() {
    console.log('socket unlink');
  }
}


module.exports = Socket;

//manager => {

  // get a new socket.io client, but make sure we don't emit anything until
  //   we've received confirmation from the server
  //const socket = Socket();
  //socket.initialized = false;

  /*
  socket.on('connection', data => {
    console.log('connection', data);
    socket.initialized = true;
    socket.isOpen = true;
    selfid = data.id;

    const num = funcs.getPresentUsers(data.room);
    collab.update(selfid, data.room);
    socket.emit('pan', { index: manager.index });
  });

  socket.on('new connection', data => {
    console.log('new connection', data);

    const name = funcs.getUsername(data);
    collab.update(selfid, data.room);
    status.normal(`${name} joined`);
  });

  socket.on('disconnection', data => {
    console.log('disconnection', data)

    const name = funcs.getUsername(data);
    collab.update(selfid, data.room);
    status.normal(`${name} left`);
  });

  socket.on('update', data => {
    console.log('update', data);
    const name = funcs.getUsername(data);
    const verb = {
      modify: 'modified',
      remove: 'removed',
      insert: 'inserted'
    }[data.type];

    socket.isOpen = false;
    status.normal(`${name} ${verb} sentence #${data.index + 1}`);

    let text;
    if (data.format === 'CoNLL-U') {
      text = convert.to.conllu(data.nx);
    } else if (data.format === 'CG3') {
      text = convert.to.cg3(data.nx);
    } else if (data.format === 'plain text') {
      text = convert.to.plainText(data.nx);
    } else {
      status.normal(`Cannot output to ${data.format}, converting to CoNLL-U`);
      text = convert.to.conllu(data.nx);
    }

    if (data.type === 'modify') {

      console.log('DEPRECATED! fix me');
      manager.parse(text, { index: data.index });

    } else if (data.type === 'insert') {
      console.log('insert', text, 'at', data.index );
    } else if (data.type === 'remove') {
      console.log('remove', text, 'at', data.index );
    }

    socket.isOpen = true;
  });

  socket.on('pan', data => {
    console.log('pan', data);
    collab.update(selfid, data.room);
  });

  return socket;
};
*/
