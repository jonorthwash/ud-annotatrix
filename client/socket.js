'use strict';

const Socket = require('socket.io-client');
const status = require('./status');
const convert = require('./convert');

function name(data) {
  return data.username || '<Anonymous>';
}

module.exports = manager => {

  // get a new socket.io client, but make sure we don't emit anything until
  //   we've received confirmation from the server
  const socket = Socket();
  socket.initialized = false;

  socket.on('connection', data => {
    console.log('connection', data);
    socket.initialized = true;
    status.normal(`(${data.present} online)`);
  });

  socket.on('new connection', data => {
    console.log('new connection', data)
    status.normal(`${name(data)} has joined (${data.present} online)`);
  });

  socket.on('disconnection', data => {
    console.log('disconnection', data)
    status.normal(`${name(data)} has left (${data.present} online)`);
  });

  socket.on('update', data => {
    console.log('update', data);
    const verb = {
      modify: 'modified',
      remove: 'removed',
      insert: 'inserted'
    }[data.type];

    socket.open = false;
    status.normal(`${name(data)} ${verb} sentence #${data.index + 1}`);

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

    socket.open = true;
  });

  return socket;
};
