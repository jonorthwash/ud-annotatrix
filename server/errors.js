'use strict';

const logger = require('./logger');

class UDAnnotatrixError extends Error {
  constructor(...args) {
    super(...args);
  }
}

class ConfigError extends UDAnnotatrixError {
  constructor(...args) {
    logger.error('ConfigError >>', ...args);
    super(...args);
  }
}

class DBError extends UDAnnotatrixError {
  constructor(...args) {
    logger.error('DBError >>', ...args);
    super(...args);
  }
}

class UploadError extends UDAnnotatrixError {
  constructor(...args) {
    logger.error('UploadError >>', ...args);
    super(...args);
  }
}

class SocketError extends UDAnnotatrixError {
  constructor(...args) {
    logger.error('SocketError >>', ...args);
    super(...args);
  }
}

module.exports = {
  UDAnnotatrixError,
  ConfigError,
  DBError,
  UploadError,
  SocketError,
};
