'use strict';

const Socket = require('socket.io-client');
const socket = Socket();

function update(data) {
  socket.emit('update', data);
}

socket.on('update', data => {
  console.log(data);
});

socket.on('connect', data => {
  console.log(data);
});

socket.on('disconnect', data => {
  console.log(data);
});


module.exports = socket;
module.exports.emit(data => socket.emit('update', data));
