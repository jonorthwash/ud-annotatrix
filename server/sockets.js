'use strict';

const SocketError = require('./errors').SocketError;

function extractTreebank(url) {
  const match = url.match(/treebank_id=([0-9a-f-]{36})(#|\/|$|&)/);
  if (!match)
    throw new SocketError(
      `Authorization Error: unable to find treebank_id in url "${url}"`);

  return match[1];
}

const ipv4reg = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/;

// room metadata
var rooms = {};

module.exports = (sio, MemoryStore) => {

  sio.set('authorization', (request, next) => {

    if (!request.headers.cookie)
      next(new SocketError(`AuthorizationError: unable to find cookie`), false);

    const sid = request.cookies['express.sid'].substring(2,34);
    MemoryStore.get(sid, (err, session) => {

      if (err)
        return next(new SocketError(`Authorization Error: ${err}`), false);

      if (!session)
        return next(new SocketError(
          `Authorization Error: unable to find session with sid "${sid}"`), false);

      request.sid = sid;
      request.token = session.token || null;
      request.username = session.username || null;
      request.treebank = extractTreebank(request.headers.referer);
      request.address = request.connection.remoteAddress;
      request.id = `${request.address}#${request.sid}`;

      next(null, true);
    });
  });

  sio.sockets.on('connection', socket => {

    (() => {

      // join the room and keep track of the number of occupants
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      socket.join(treebank);
      if (!rooms[treebank])
        rooms[treebank] = { users: {} };

      rooms[treebank].users[id] = {
        index: null,
        address: socket.request.address,
        username: socket.request.username
      };

      // debugging stuff
      console.log(`New connection (username: ${socket.request.username})`);
      console.log('rooms:', rooms);

      // broadcast the new connection to the rest of the room
      //   and back to the original client
      const response = {
        id: id,
        username: socket.request.username,
        room: rooms[treebank]
      };
      socket.broadcast.to(treebank).emit('new connection', response);
      socket.emit('connection', response);

    })();

    socket.on('disconnect', () => {

      // remove this user from the room
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      if (rooms[treebank])
        delete rooms[treebank].users[id];

      // debugging stuff
      console.log(`End connection (username: ${socket.request.username})`);
      console.log('rooms:', rooms);

      socket.broadcast.to(treebank).emit('disconnection', {
        username: socket.request.username,
        room: rooms[treebank]
      });
    });

    socket.on('update', data => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      socket.broadcast.to(treebank).emit('update', data);

      // debugging stuff
      console.log(`Update treebank ${treebank}:`, data);
      console.log('rooms:', rooms);
    });

  });
};
