'use strict';

// basic stuff
const logger = require('./logger');
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
const compression = require('compression');
const MemoryStore = new session.MemoryStore();
// compress all responses
app.use(compression());
app.use(morgan(cfg.environment === 'development' ? 'dev' : 'tiny'));
app.use(bodyParser.json({limit: '200mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}))
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
	logger.info(`Server listening at ${cfg.protocol}://${cfg.host}:${cfg.port}`);
  logger.info(`ENV: ${cfg.environment}`);
  if (cfg.environment === 'development')
		logger.info(cfg);
});

// set up sockets
const socketIO = require('socket.io');
const socketIOCookieParser = require('socket.io-cookie-parser');
const sio = socketIO.listen(server);
sio.use(socketIOCookieParser());
require('./sockets')(sio, MemoryStore);
