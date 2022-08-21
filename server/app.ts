import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import * as http from "http";
import * as morgan from "morgan";
import * as nocache from "nocache";
import * as session from "express-session";
import * as socketIOCookieParser from "socket.io-cookie-parser";
import * as socketIO from "socket.io";

import {cfg} from "./config";
import {configureRoutes} from "./routes";
import {configureSocketIO} from "./sockets";

const app = express();
const MemoryStore = new session.MemoryStore();
app.use(morgan(cfg.environment === "development" ? "dev" : "tiny"));
app.use(bodyParser.json({limit: "500mb"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(fileUpload());
app.use(session({store: MemoryStore, secret: cfg.secret, key: "express.sid", saveUninitialized: true, resave: false}));
if (cfg.environment === "development")
  app.use(nocache());
app.set("view engine", "ejs");
app.set("views", "server/views");

// routes
configureRoutes(app);
app.use(express.static("server/public"));

// run server
const server = http.createServer(app).listen(cfg.port, () => {
  console.log(`Express server listening at ${cfg.protocol}://${cfg.host}:${cfg.port}`);
  console.log("ENV:", cfg.environment);
  if (cfg.environment === "development")
    console.dir(cfg);
});

// set up sockets
const sio = socketIO.listen(server);
sio.use(socketIOCookieParser());
configureSocketIO(sio, MemoryStore);
