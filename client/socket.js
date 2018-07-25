'use strict';

const Socket = require('socket.io-client');
const socket = Socket();

// global w/in this module
//   allows us to avoid relying on a true global variable
var manager = null;

function update(type, body) {

  socket.emit('update', {
    type: type,
    body: body
  });

}

socket.on('update', data => {
  if (!manager)
    return;

  console.log(data);
});

socket.on('connect', data => {
  if (!manager)
    return;

  console.log(data);
});

socket.on('disconnect', data => {
  if (!manager)
    return;

  console.log(data);
});


module.exports = mgr => {

  // set the semi-global guy here
  manager = mgr;
  return socket;
};
module.exports.emit = update;
