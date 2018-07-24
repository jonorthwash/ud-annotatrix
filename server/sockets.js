'use strict';

function onConnect(socket) {
  console.log(socket);
}


// count of users on each page
var users = {};

module.exports = (sio) => {

  sio.set('authorization', (handshake, next) => {
    console.log(handshake);
    next(null, true);
  });

  sio.sockets.on('connection', socket => {
    console.log('connection!');

    onConnect(socket);

    socket.on('disconnect', () => {
      console.log('disconnect!');
    });

    socket.on('update', data => {
      console.log('data!', data);
    });

  });
};
