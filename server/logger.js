const fs = require('fs');
const path = require('path');
const pino = require('pino');
const pinoms = require('pino-multi-stream');

const prettyStream = pinoms.prettyStream(
    { colorize: true, translateTime: "SYS:standard", ignore: "hostname,pid,time" }
);

const streams = [
    {level: 'trace', stream: fs.createWriteStream(path.resolve("app.log"), {flags:"a"})},
    {level: 'debug', stream: prettyStream}
];

const pn = pinoms(pinoms.multistream(streams));
pn.level = "trace";

module.exports = pn;
