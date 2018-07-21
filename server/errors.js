'use strict';

class UDAnnotatrixError extends Error {
  constructor(...args) {
    super(...args);
  }
}

class ConfigError extends UDAnnotatrixError {
  constructor(...args) {
    super(...args);
  }
}

module.exports = {
  UDAnnotatrixError,
  ConfigError
};
