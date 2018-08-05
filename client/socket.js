'use strict';

const _ = require('underscore');
const utils = require('./utils');
const _Socket = require('socket.io-client');


class Socket {
  constructor(app) {
    this.app = app;
    this._socket = utils.check_if_browser()
      ? new _Socket()
      : null;
    this.initialized = false;
  }

  broadcast(...args) {
    console.log('broadcast', ...args);
  }

  on(...args) {
    console.log('socket on', ...args);
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
