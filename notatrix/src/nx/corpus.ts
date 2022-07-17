"use strict";

import * as _ from "underscore";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuid } from "uuid";

import {Labeler, LabelerSerial, SortedLabel} from "./labeler";
import {NxBaseClass} from "./base-class";
import {NxError} from "../utils/errors";
import {Options} from "./options";
import {Sentence, SentenceSerial} from "./sentence";

const split: any = require("../splitter");
const detect: any = require("../detector");
const parse: any = require("../parser");
const generate: any = require("../generator");
const convert: any = require("../converter");

interface CorpusSerial {
  filename: string|null;
  meta: CorpusMeta;
  options: Options;
  labeler: LabelerSerial;
  sentences: SentenceSerial[];
  index: number;
}

interface CorpusMeta {
}

interface CorpusSnapshot {
  filename: string|null;
  sentences: number;
  errors: number;
  labels: SortedLabel[];
}

/**
 * Abstraction over a collection of Sentences.  NOTE: this class is
 *  out-of-date and will be replaced soon :)
 */
export class Corpus extends NxBaseClass {
  treebank_id: string;
  filename: string|null;
  options: Options;
  sources: string[];
  _labeler: Labeler;
  _sentences: Sentence[];
  _index: number;
  _meta: CorpusMeta;
  _filterIndex: number;

  constructor(options: Options) {
    super("Corpus");
    this.treebank_id = uuid();

    options = _.defaults(options, {
      requireOne: true,
    });
    this.filename = null;
    this.options = options;
    this.sources = [];

    this._labeler = new Labeler(this);
    this._sentences = [];
    this._index = -1;
    this._meta = {};
    this._filterIndex = -1;
  }

  get snapshot(): CorpusSnapshot {
    return {
      filename: this.filename,
      sentences: this.length,
      errors: this.errors.length,
      labels: this._labeler.sort(),
    };
  }

  get length(): number { return this._sentences.length; }

  get errors(): Sentence[] {
    return this._sentences.filter(sent => !sent.isParsed);
  }

  serialize(): CorpusSerial {
    return {
      filename: this.filename,
      meta: this._meta,
      options: this.options,
      labeler: this._labeler.serialize(),
      sentences: this._sentences.map(sent => sent.serialize(this.options)),
      index: this._index,
    };
  }

  static deserialize(serial: CorpusSerial): Corpus {
    const corpus = new Corpus(serial.options);
    corpus.filename = serial.filename || null;
    corpus._meta = serial.meta;
    corpus._labeler = Labeler.deserialize(corpus, serial.labeler);
    corpus._sentences = serial.sentences.map(s => {
      const sent = new Sentence(s, _.defaults(s.options, serial.options));
      sent._meta = s.meta;

      _.each(corpus._labeler._labels, (label, name) => {
        if (corpus._labeler.sentenceHasLabel(sent, name))
          label._sents.add(sent);
      });

      return sent;
    });
    corpus.index = serial.index;

    return corpus;
  }

  get sentence(): Sentence|null { return this.index < 0 ? null : this._sentences[this.index]; }

  get filtered(): Sentence[] {
    return this._labeler._filter.size
               ? this._sentences.filter(
                     sent => this._labeler.sentenceInFilter(sent))
               : [];
  }

  get index(): number { return this._index; }

  set index(index: number) {
    const filtered = this.filtered, total = filtered.length || this.length;

    index = parseInt(index as unknown as string);
    if (isNaN(index)) {
      index = filtered.length ? this._filterIndex : this.index;

    } else if (index < 0 && total) {
      index = 0;

    } else if (index > total - 1) {
      index = total - 1;
    }

    if (filtered.length) {
      this._filterIndex = index;
      this._index = filtered[index]._index;
    } else {
      this._filterIndex = -1;
      this._index = index;
    }
  }

  reindex(): void {
    this._sentences.forEach((sent, i) => { sent._index = i; });
  }

  first(): Corpus {
    this.index = this.length ? 0 : -1;
    return this;
  }

  prev(): Corpus|null {
    if (!this.length)
      return null;

    const filtered = this.filtered;
    let index = filtered.length ? this._filterIndex : this._index;

    if (index === 0)
      return null;

    this.index = --index;
    return this;
  }

  next(): Corpus|null {
    if (!this.length)
      return null;

    const filtered = this.filtered;
    let index = filtered.length ? this._filterIndex : this._index;
    let total = filtered.length ? filtered.length - 1 : this.length - 1;

    if (index === total)
      return null;

    this.index = ++index;
    return this;
  }

  last(): Corpus|null {
    const filtered = this.filtered;
    this.index = filtered.length ? filtered.length - 1 : this.length - 1;

    return this;
  }

  getSentence(index: number): Sentence|null {
    if (index == undefined)
      index = this.index;

    if (0 > index || index > this.length - 1)
      return null;

    return this._sentences[index] || null;
  }

  setSentence(indexParam: string|number, textParam?: string): Sentence {
    let index: number;
    let text: string;

    if (textParam === null || textParam === undefined) { // if only passed 1 arg
      text = (indexParam as string) || "";
      index = this.index;
    } else {
      text = textParam;
      index = indexParam as number;
    }

    index = parseInt(index as unknown as string);
    if (isNaN(index) || this.getSentence(index) === null)
    throw new NxError(`cannot set sentence at index ${index}`);

    this._labeler.onRemove(this.getSentence(index));
    const sent = new Sentence(text, this.options);
    sent.corpus = this;

    this._sentences[index] = sent;
    this._labeler.onAdd(sent);
    this.reindex();

    return sent;
  }

  insertSentence(indexParam?: string|number, textParam?: string): Sentence {
    let index: number;
    let text: string;

    if (textParam === null || textParam === undefined) { // if only passed 1 arg
      text = (indexParam as string) || "";
      index = this.index + 1;
    } else {
      text = textParam;
      index = indexParam as number;
    }

    index = parseFloat(index as unknown as string);
    if (isNaN(index))
      throw new NxError(`cannot insert sentence at index ${index}`);

    index = index < 0 ? 0 : index > this.length ? this.length : parseInt(index as unknown as string);

    const sent = new Sentence(text, this.options);
    sent.corpus = this;

    this._sentences = this._sentences.slice(0, index).concat(sent).concat(
        this._sentences.slice(index));
    this._labeler.onAdd(sent);

    this.index = index;
    this.reindex();
    return sent;
  }

  removeSentence(index: number|undefined): Sentence|null {
    if (!this.length)
      return null;

    if (index === undefined) // if not passed args
      index = this.index;

    index = parseFloat(index as unknown as string);
    if (isNaN(index))
      throw new NxError(`cannot remove sentence at index ${index}`);

    index = index < 0
                ? 0
                : index > this.length - 1 ? this.length - 1 : parseInt(index as unknown as string);

    const removed = this._sentences.splice(index, 1)[0];
    if (!this.length)
      this.insertSentence();

    this._labeler.onRemove(removed);

    if (index <= this.index)
      this.index--;
    this.reindex();
    return removed;
  }

  pushSentence(text: string): Sentence { return this.insertSentence(Infinity, text); }

  popSentence(): Sentence { return this.removeSentence(Infinity); }

  parse(s: string): Corpus {
    const splitted = split(s, this.options); // might throw errors
    const index = this.index || 0;
    console.log('parse() ' + index);

    splitted.forEach((split: string, i: number) => {
      // console.log(i, split);
      //this.insertSentence(index + i, split, false);
      this.pushSentence(split);
      console.log('pushSentence() ' + i);
    });

    return this;
  }

  static fromString(s: string, options: Options): Corpus {
    const corpus = new Corpus(options);
    corpus.parse(s);
    corpus.index = 0;
    return corpus;
  }

  readFile(filepath: string, next: (corpus: Corpus) => void): void {
    fs.exists(filepath, exists => {
      if (!exists)
        throw new NxError(`cannot read file: cannot find path ${filepath}`);

      fs.readFile(filepath, (err, data) => {
        if (err)
          throw err;

        const contents = data.toString();
        this.parse(contents);
        this.sources.push(filepath);
        this.filename = path.basename(filepath);

        if (next)
          next(this);
      });
    });
  }

  static fromFile(filepath: string, options: Options|((corpus: Corpus) => void), next?: (corpus: Corpus) => void): typeof Corpus {
    if (next === undefined) {
      next = options as (corpus: Corpus) => void;
      options = {};
    }
    const corpus = new Corpus(options as Options);
    corpus.readFile(filepath, next);

    return this;  // 'this' is the class, not the instance..
  }

  writeFile(format: string, filepath: string): Corpus {
    filepath = this.getWritePath(filepath);

    const contents = this.serialize();
    fs.writeFile(filepath, JSON.stringify(contents), err => {
      if (err)
        throw err;
    });

    return this;
  }

  getWritePath(filepath: string|null): string {
    if (filepath)
      return filepath;

    const lastSource = this.sources.slice(-1)[0];
    return (lastSource || "export") + ".nxcorpus";
  }
}
