'use strict';

const Socket = require('socket.io-client');
const status = require('./status');
const nx = require('notatrix');

function name(data) {
  return data.username || '<Anonymous>';
}

module.exports = manager => {

  const socket = Socket();

  socket.on('connection', data => {
    console.log('connection', data);
    status.normal(`Currently online: ${data.present}`);
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

    status.normal(`${name(data)} ${verb} sentence #${data.index + 1}`);
    console.log(nx.Sentence.fromNx(data.nx).text)
  });

  return socket;
};
