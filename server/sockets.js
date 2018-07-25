'use strict';

const SocketError = require('./errors').SocketError;

// scope this here so that all functions will have access to it
//   once it's initialized in the module exports
var MemoryStore = null;

function onConnect(socket) {

  // join the room and keep track of the number of occupants
  const treebank = socket.request.treebank;
  socket.join(treebank)
  users[treebank] = users[treebank] + 1 || 1;

  // debugging stuff
  console.log(`New connection (username: ${socket.request.username})`);
  console.log('users:', users);

  // broadcast the new connection to the rest of the room
  //   and back to the original client
  const response = {
    username: socket.request.username,
    present: users[treebank]
  };
  socket.broadcast.to(treebank).emit('new connection', response);
  socket.emit('connection', response);
}

function authorize(request, next) {

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

    next(null, true);
  });
}

function extractTreebank(url) {
  const match = url.match(/treebank_id=([0-9a-f-]{36})(#|\/|$|&)/);
  if (!match)
    throw new SocketError(
      `Authorization Error: unable to find treebank_id in url "${url}"`);

  return match[1];
}

// count of users on each page
var users = {};

module.exports = (sio, MemoryStore_) => {

  // this should be visible to all the funcs in this module
  MemoryStore = MemoryStore_;

  sio.set('authorization', authorize);

  sio.sockets.on('connection', socket => {

    onConnect(socket);

    socket.on('disconnect', () => {

      // decrease the number of users in this room
      users[socket.request.treebank] -= 1;

      // debugging stuff
      console.log(`End connection (username: ${socket.request.username})`);
      console.log('users:', users);
    });

    socket.on('update', data => {

      // forward the data along to anyone else in this room
      const treebank = socket.request.treebank;
      socket.broadcast.to(treebank).emit('update', data);

      // debugging stuff
      console.log(`Update treebank ${treebank}:`, data);
      console.log('users:', users);
    });

  });
};
