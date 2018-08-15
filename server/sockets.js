'use strict';

const SocketError = require('./errors').SocketError;

function extractTreebank(url) {
  const match = url.match(/treebank_id=([0-9a-f-]{36})(#|\/|$|&)/);
  if (!match)
    throw new SocketError(
      `Authorization Error: unable to find treebank_id in url "${url}"`);

  return match[1];
}

// room metadata
var rooms = {};

module.exports = (sio, MemoryStore) => {

  sio.set('authorization', (request, next) => {

    if (!request.headers.cookie || !request.cookies['express.sid'])
      next(new SocketError(`AuthorizationError: unable to find cookie`), false);

    const sid = (request.cookies['express.sid'] || '').substring(2,34);
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
        id: id,
        index: null,
        mouse: null,
        locked: null,
        address: socket.request.address,
        username: socket.request.username
      };

      // debugging stuff
      console.log(`New connection (id: ${id})`);
      console.log('rooms:', rooms);

      // broadcast the new connection to the rest of the room
      //   and back to the original client
      const response = {
        id: id,
        index: null,
        mouse: null,
        locked: null,
        username: socket.request.username,
        address: socket.request.address,
        room: rooms[treebank]
      };
      socket.broadcast.to(treebank).emit('connection', response);
      socket.emit('initialization', response);

    })();

    socket.on('disconnect', () => {

      // remove this user from the room
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      if (rooms[treebank])
        delete rooms[treebank].users[id];

      // debugging stuff
      console.log(`End connection (id: ${id})`);
      console.log('rooms:', rooms);

      socket.broadcast.to(treebank).emit('disconnection', {
        id: id,
        index: null,
        mouse: null,
        locked: null,
        username: socket.request.username,
        address: socket.request.address,
        room: rooms[treebank]
      });
    });

    socket.on('modify corpus', data => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const id = socket.request.id;
      data.id = id;

      socket.broadcast.to(treebank).emit('modify corpus', data);

      // debugging stuff
      //console.log(`Update treebank ${treebank}:`, data);
      //console.log('room:', rooms[treebank]);
    });

    socket.on('lock graph', locked => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      const user = rooms[treebank].users[id];
      user.locked = locked;

      const response = {
        id: id,
        locked: locked,
      };

      socket.broadcast.to(treebank).emit('unlock graph', response);
    });

    socket.on('unlock graph', () => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      const user = rooms[treebank].users[id];
      user.locked = null;

      const response = {
        id: id,
        locked: null,
      };

      socket.broadcast.to(treebank).emit('unlock graph', response);
    });

    socket.on('move mouse', mouse => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      const user = rooms[treebank].users[id];
      user.mouse = mouse;

      const response = {
        id: id,
        mouse: mouse,
      };

      socket.broadcast.to(treebank).emit('move mouse', response);

    });

    socket.on('modify index', index => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const id = socket.request.id;

      const user = rooms[treebank].users[id];
      user.index = index;

      const response = {
        id: id,
        index: index,
      };

      socket.broadcast.to(treebank).emit('modify index', response);
      socket.emit('modify index', response);

      console.log('modify index packet', response)

      // debugging stuff
      //console.log(`Update treebank ${treebank}:`, data);
      //console.log('room:', rooms[treebank]);

      /*
      const id = socket.request.id;

      rooms[treebank].users[id] = {
        index: data.index,
        address: socket.request.address,
        username: socket.request.username
      };

      // debugging stuff
      console.log(`pan to ${data.index + 1} (id: ${id})`);
      console.log('rooms:', rooms);

      // broadcast the new connection to the rest of the room
      //   and back to the original client
      const response = {
        room: rooms[treebank]
      };
      socket.broadcast.to(treebank).emit('pan', response);
      socket.emit('pan', response);
      */
    });

    socket.on('new message', data => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      socket.broadcast.to(treebank).emit('new message', data);

      // debugging stuff
      //console.log(`Update treebank ${treebank}:`, data);
      //console.log('room:', rooms[treebank]);

    });

  });
};
