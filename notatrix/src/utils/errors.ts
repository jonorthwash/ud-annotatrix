"use strict";

export class NotatrixError extends Error {}

export class ToolError extends NotatrixError {}

export class SplitterError extends ToolError {
  text: string
  options: any

  constructor(message, text, options) {
    super(message);

    this.name = "SplitterError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, SplitterError.prototype);
  }
}

export class DetectorError extends ToolError {
  text: string
  options: any

  constructor(message, text, options) {
    super(message);

    this.name = "DetectorError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, DetectorError.prototype);
  }
}

export class ParserError extends ToolError {
  text: string
  options: any

  constructor(message, text, options) {
    super(message);

    this.name = "ParserError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

export class GeneratorError extends ToolError {
  nx: string
  options: any

  constructor(message, nx, options) {
    super(message);

    this.name = "GeneratorError";
    this.nx = nx;
    this.options = options;

    Object.setPrototypeOf(this, GeneratorError.prototype);
  }
}

export class ConverterError extends ToolError {
  constructor(message) {
    super(message);

    this.name = "ConverterError";

    Object.setPrototypeOf(this, ConverterError.prototype);
  }
}

export class NxError extends NotatrixError {
  constructor(...args) {
    super(...args);
    this.name = "NxError";

    Object.setPrototypeOf(this, NxError.prototype);
  }
}

export class DBError extends NotatrixError {}
