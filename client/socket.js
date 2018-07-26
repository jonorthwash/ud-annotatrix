'use strict';

const Socket = require('socket.io-client');
const status = require('./status');
const convert = require('./convert');
const collab = require('./collaboration');
const funcs = require('./funcs');

var selfid = null;

module.exports = manager => {

  // get a new socket.io client, but make sure we don't emit anything until
  //   we've received confirmation from the server
  const socket = Socket();
  socket.initialized = false;

  socket.on('connection', data => {
    console.log('connection', data);
    socket.initialized = true;
    selfid = data.id;

    const num = funcs.getPresentUsers(data.room);
    collab.update(selfid, data.room);
  });

  socket.on('new connection', data => {
    console.log('new connection', data);

    const name = funcs\.getUsername(data);
    collab.update(selfid, data.room);
    status.normal(`${name} joined`);
  });

  socket.on('disconnection', data => {
    console.log('disconnection', data)

    const name = funcs\.getUsername(data);
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

      manager.parse(text, { index: data.index });

    } else if (data.type === 'insert') {
      console.log('insert', text, 'at', data.index );
    } else if (data.type === 'remove') {
      console.log('remove', text, 'at', data.index );
    }

    socket.isOpen = true;
  });

  return socket;
};
