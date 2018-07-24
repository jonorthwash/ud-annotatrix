'use strict';

const _ = require('underscore');
const cfg = require('./config');

class Log {
  constructor(levelName, writer = console.log) {

    this._write = writer;
    this.level = levelName || cfg.defaultLoggingLevel;

  }

  set level(levelName) {
    this._levelName = levelName;
    this._level = ['CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG']
      .indexOf(levelName);

    if (levelName === 'SILENT') {
      this.critical = this.error = this.warn = this.info = this.debug = this.out = () => {};
      this._level = -Infinity;
    }

    if (this._level === -1) {
      this.out(`Unrecognized Logger levelName "${levelName}", setting level to CRITICAL.`);
      this._levelName = 'CRITICAL';
      this._level = 0;
    }

    this.out(`logging level set to ${this._levelName}`, 'OK');
  }

  toString() {
    return `Logger (level=${this._levelName})`;
  }

  _format(message, tag=null, showTimestamp=true) {

    let title = '', msg = '';
    if (showTimestamp) {
      let date = new Date();
      title += `[${date}] `;
      msg += `[${date}] `;
    }
    if (tag !== null) {
      title += `${tag}: `;
      msg += `${tag}: `;
    }
    title += (message.match(/\n/) === null  // title should only be 1 line
      ? message
      : `${message.split('\n')[0]} [...]`);
    msg += message

    return { title:title, msg:msg };

  }

  _handle(level, tag, message='') {
    if (level <= this._level) {
      const formatted = this._format(message, tag, true);
      console.group(formatted.title);
        this._write(formatted.msg);
        console.trace();
      console.groupEnd();
    }
  }

  critical(message) {
    this._handle(0, 'CRITICAL', message);
  }
  error(message) {
    this._handle(1, 'ERROR', message);
  }
  warn(message) {
    this._handle(2, 'WARN', message);
  }
  info(message) {
    debugger;
    this._handle(3, 'INFO', message);
  }
  debug(message) {
    this._handle(4, 'DEBUG', message);
  }

  out(message, tag) {
    const formatted = this._format(message, tag, false);
    this._write(formatted.msg);
  }

}

module.exports = Log;
