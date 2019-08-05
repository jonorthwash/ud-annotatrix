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
if (cfg.environment === 'development'){
  app.use(nocache());
}
app.set('view engine', 'ejs');
app.set('views', 'server/views');

const colors = require('ansi-colors');

// WIP
// route requests logging middleware
const appLogger = function (req, res, next) {
  const started = process.hrtime();

  res.on("finish", () => {
    const elapsed = process.hrtime(started);
    const time = Math.round(elapsed[0] * 1e3 + elapsed[1] * 1e-6);
    const ip = req.ip == "::ffff:127.0.0.1" ? "" : req.ip;
    const codeClass = res.statusCode == 200 ? "green" : "red";
    const timeClass = time > 1000 ? "inverse": "dim";
    console.log(ip + req.method, req.originalUrl, colors[codeClass](res.statusCode), colors[timeClass](time), "ms", req.xhr?colors.bold("<AJAX>"):"");
  });

  next();
}

app.use(appLogger);

// routes
require('./routes')(app);
app.use(express.static('server/public'));




// run server
const server = http.createServer(app).listen(cfg.port, () => {
	logger.info(`Server listening at ${cfg.protocol}://${cfg.host}:${cfg.port}`);
  logger.info(`ENV: ${cfg.environment}`);
  if (cfg.environment === 'development') {
		logger.info(cfg, "APP CONFIG:");
  }
});

// set up sockets
const socketIO = require('socket.io');
const socketIOCookieParser = require('socket.io-cookie-parser');
const sio = socketIO.listen(server);
sio.use(socketIOCookieParser());
require('./sockets')(sio, MemoryStore);
