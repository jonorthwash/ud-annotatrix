'use strict';

class UDAnnotatrixError extends Error {
  constructor(...args) {
    super(...args);
  }
}

class ConfigError extends UDAnnotatrixError {
  constructor(...args) {
    console.log('ConfigError:', ...args);
    super(...args);
  }
}

class DBError extends UDAnnotatrixError {
  constructor(...args) {
    console.log('DBError:', ...args);
    super(...args);
  }
}

class UploadError extends UDAnnotatrixError {
  constructor(...args) {
    console.log('UploadError:', ...args);
    super(...args);
  }
}

class SocketError extends UDAnnotatrixError {
  constructor(...args) {
    console.log('SocketError:', ...args);
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
