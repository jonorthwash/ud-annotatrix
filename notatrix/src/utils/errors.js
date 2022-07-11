"use strict";

class NotatrixError extends Error {};

class ToolError extends NotatrixError {};

class SplitterError extends ToolError {
  constructor(message, text, options) {
    super(message);

    this.name = "SplitterError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, SplitterError.prototype);
  }
}

class DetectorError extends ToolError {
  constructor(message, text, options) {
    super(message);

    this.name = "DetectorError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, DetectorError.prototype);
  }
}

class ParserError extends ToolError {
  constructor(message, text, options) {
    super(message);

    this.name = "ParserError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

class GeneratorError extends ToolError {
  constructor(message, nx, options) {
    super(message);

    this.name = "GeneratorError";
    this.nx = nx;
    this.options = options;

    Object.setPrototypeOf(this, GeneratorError.prototype);
  }
}

class ConverterError extends ToolError {
  constructor(message) {
    super(message);

    this.name = "ConverterError";

    Object.setPrototypeOf(this, ConverterError.prototype);
  }
}

class NxError extends NotatrixError {
  constructor(...args) {
    super(...args);
    this.name = "NxError";

    Object.setPrototypeOf(this, NxError.prototype);
  }
}

class DBError extends NotatrixError {};

module.exports = {

  NotatrixError,

  ToolError,
  SplitterError,
  DetectorError,
  ParserError,
  GeneratorError,
  ConverterError,

  NxError,
  DBError,

};
