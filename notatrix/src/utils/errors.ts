"use strict";

import type {Options} from "../nx/options";
import type {Sentence, SentenceSerial} from "../nx/sentence";
import type {TokenSerial} from "../nx/base-token";
import type {Input} from "../base";

export class NotatrixError extends Error {}

export class ToolError extends NotatrixError {}

export class SplitterError extends ToolError {
  text: string;
  options: Options;

  constructor(message: string, text: string, options: Options) {
    super(message);

    this.name = "SplitterError";
    this.text = text;
    this.options = options;

    Object.setPrototypeOf(this, SplitterError.prototype);
  }
}

export class DetectorError extends ToolError {
  input: Input;
  options: Options;

  constructor(message: string, input: Input, options: Options) {
    super(message);

    this.name = "DetectorError";
    this.input = input;
    this.options = options;

    Object.setPrototypeOf(this, DetectorError.prototype);
  }
}

export class ParserError extends ToolError {
  input: Input;
  options: Options;

  constructor(message: string, input: Input, options: Options) {
    super(message);

    this.name = "ParserError";
    this.input = input;
    this.options = options;

    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

export class GeneratorError extends ToolError {
  nx: Sentence;
  options: Options;

  constructor(message: string, nx: Sentence, options: Options) {
    super(message);

    this.name = "GeneratorError";
    this.nx = nx;
    this.options = options;

    Object.setPrototypeOf(this, GeneratorError.prototype);
  }
}

export class ConverterError extends ToolError {
  constructor(message: string) {
    super(message);

    this.name = "ConverterError";

    Object.setPrototypeOf(this, ConverterError.prototype);
  }
}

export class NxError extends NotatrixError {
  constructor(message: string) {
    super(message);
    this.name = "NxError";

    Object.setPrototypeOf(this, NxError.prototype);
  }
}

export class DBError extends NotatrixError {}
