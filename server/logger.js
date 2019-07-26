const fs = require('fs');
const path = require('path');
const pino = require('pino');

const multistream = require('pino-multi-stream').multistream;
const streams = [
  {stream: fs.createWriteStream('app.log')},
  {stream: process.stdout}
]

const logger = pino({
  level: 'trace'
}, multistream(streams))

module.exports = logger;
