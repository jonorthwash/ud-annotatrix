'use strict';

const Room = require('./room');
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

      socket.join(treebank);
      const room = rooms[treebank] = rooms[treebank] || new Room();
      const user = room.addUser(socket.request);

      // debugging stuff
      console.log(`user:`, user);
      console.log('rooms:', rooms);

      const response = Object.assign({}, user);
      response.room = { users: room.users };
      socket.broadcast.to(treebank).emit('connection', response);
      socket.emit('initialization', response);

    })();

    socket.on('disconnect', () => {

      // remove this user from the room
      const treebank = socket.request.treebank;
      const room = rooms[treebank];
      const user = room.removeUser(socket.request);

      // debugging stuff
      console.log(`user:`, user);
      console.log('rooms:', rooms);

      const response = Object.assign({}, user);
      response.room = { users: room.users };
      socket.broadcast.to(treebank).emit('disconnection', response);

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
      const room = rooms[treebank];
      const user = room.editUser(socket.request, { locked: locked });

      const response = {
        id: user.id,
        locked: locked,
      };

      socket.broadcast.to(treebank).emit('lock graph', response);
    });

    socket.on('unlock graph', () => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const room = rooms[treebank];
      const user = room.editUser(socket.request, { locked: null });

      const response = {
        id: user.id,
        locked: null,
      };

      socket.broadcast.to(treebank).emit('unlock graph', response);
    });

    socket.on('move mouse', mouse => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const room = rooms[treebank];
      const user = room.editUser(socket.request, { mouse: mouse });

      const response = {
        id: user.id,
        mouse: mouse,
      };

      socket.broadcast.to(treebank).emit('move mouse', response);

    });

    socket.on('modify index', index => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      const room = rooms[treebank];
      const user = room.editUser(socket.request, { index: index });

      const response = {
        id: user.id,
        index: index,
      };

      socket.broadcast.to(treebank).emit('modify index', response);
      socket.emit('modify index', response);

      console.log('modify index packet', response)

      // debugging stuff
      //console.log(`Update treebank ${treebank}:`, data);
      //console.log('room:', rooms[treebank]);

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
