'use strict';

const SocketError = require('./errors').SocketError;

var MemoryStore = null;

function onConnect(socket) {
  console.log('onConnect');
  let req = socket.request;

  const treebank = socket.request.treebank;
  socket.join(treebank)
  users[treebank] = users[treebank] + 1 || 1;
  
  /*
  numUsersByPage[req.ref] = numUsersByPage[req.ref]+1 || 1;
  console.log(`User ${req.session.user.name} connected to ${req.ref} (${numUsersByPage[req.ref]} total)`);

  let response = {
    user : req.session.user,
    numUsers: numUsersByPage[req.ref]
  };

  // broadcast out (to other clients)
  socket.broadcast.to('admin').emit('new connection', response);
  socket.broadcast.to('lobby').emit('new connection', response);

  // emit back (to original client)
  socket.emit('on connection', response);
  */
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
    request.token = session.token;
    request.username = session.username;
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
    //console.log('connection!');

    onConnect(socket);

    socket.on('disconnect', () => {
      //console.log('disconnect!');
    });

    socket.on('update', data => {
      //console.log('data!', data);
    });

  });
};
