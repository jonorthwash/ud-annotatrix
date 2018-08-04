'use strict';

// basic stuff
const cfg = require('./config');
const express = require('express');
const app = express();
const http = require('http');

// express plugins
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const nocache = require('nocache');
const session = require('express-session');
const MemoryStore = new session.MemoryStore();
app.use(morgan(cfg.environment === 'development' ? 'dev' : 'tiny'));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(session({
  store: MemoryStore,
  secret: cfg.secret,
  key: 'express.sid',
  saveUninitialized: true,
  resave: false
}));
if (cfg.environment === 'development')
  app.use(nocache());
app.set('view engine', 'ejs');
app.set('views', 'server/views');

// routes
require('./routes')(app);
app.use(express.static('server/public'));

// run server
const server = http.createServer(app).listen(cfg.port, () => {
  console.log(`Express server listening at ${cfg.protocol}://${cfg.host}:${cfg.port}`);
  if (cfg.environment === 'development')
    console.dir(cfg);
});

// set up sockets
const socketIO = require('socket.io');
const socketIOCookieParser = require('socket.io-cookie-parser');
const sio = socketIO.listen(server);
sio.use(socketIOCookieParser());
require('./sockets')(sio, MemoryStore);
