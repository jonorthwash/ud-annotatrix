"use strict";

import * as _ from "underscore";
import { v4 as uuid } from "uuid";

import {thin, noop} from "../utils/funcs";
import {NxError} from "../utils/errors";
import {NxBaseClass} from "./base-class";
import {RelationItem, RelationSet} from "./relation-set";
import type {Analysis, AnalysisSerial} from "./analysis";
import type {Sentence} from "./sentence";
import type {SubToken} from "./sub-token";

// TODO: We need to clean these up...
export type ConlluIndex = string|number;
export type Cg3Index = number|null;
type CytoscapeIndex = number;
type SerialIndex = unknown;

interface Indices {
  absolute?: number;
  conllu: ConlluIndex;
  cg3: Cg3Index;
  cytoscape: CytoscapeIndex;
  serial?: SerialIndex;
  sup?: number;
  ana?: number;
  sub?: number;
}

interface HeadSerial {
  index: number|string;
  deprel: string;
}

export interface TokenSerial {
  uuid?: string;
  form?: string;
  lemma?: string;
  index?: number|string;
  semicolon?: boolean;
  isEmpty?: boolean;
  upostag?: string;
  xpostag?: string
  feats?: string[];
  misc?: string[];
  heads?: HeadSerial[];
  analyses?: AnalysisSerial[];
}

/**
 * Ancestor of Token, SubToken, SuperToken.  Implements methods common
 *  to all three of them.
 */
export class BaseToken extends NxBaseClass {
  sent: Sentence;
  uuid: string;
  semicolon: boolean;
  isEmpty: boolean;
  form: string;
  lemma: string;
  upostag: string;
  xpostag: string;
  _feats_init: boolean;
  _feats: string[];
  _misc_init: boolean;
  _misc: string[];
  _heads: HeadSerial[];
  heads: RelationSet;
  dependents: RelationSet;
  indices: Indices;
  _analyses: Analysis[]|undefined;

  constructor(sent: Sentence, name: string, serial: TokenSerial = {}) {
    super(name);

    this.sent = sent;
    this.uuid = uuid();

    this.uuid = serial.uuid || this.uuid;

    this.semicolon = serial.semicolon;
    this.isEmpty = serial.isEmpty;
    this.form = serial.form;
    this.lemma = serial.lemma;
    this.upostag = serial.upostag;
    this.xpostag = serial.xpostag;
    this.feats = serial.feats;
    this.misc = serial.misc;

    this._heads = serial.heads;
    this.heads = new RelationSet(this, "dependents");
    this.dependents = new RelationSet(this, "heads");

    this.indices = {
      conllu: null,
      cg3: null,
      cytoscape: null,
      serial: serial.index,
    };
  }

  /**
   * Add a head to a token with a dependency relation.
   */
  addHead(head: BaseToken, deprel?: string): boolean {
    if (!(head instanceof BaseToken))
      throw new NxError("cannot add head unless it is a token");

    if (head === this)
      throw new NxError("token cannot be its own head");

    if (typeof deprel !== "string" && deprel != null)
      throw new NxError("deprel must be a string, null, or undefined");

    if(this.upostag == "PUNCT" && deprel == null)
      deprel = "punct";

    // if we're not enhanced, only can have 1 head at a time
    if (!this.sent.options.enhanced)
      this.heads.clear();

    return this.heads.add(head, deprel);
  }

  /**
   * Change the dependency relation for a given head.
   */
  modifyHead(head: BaseToken, deprel: string): boolean {
    if (!(head instanceof BaseToken))
      throw new NxError("cannot add head unless it is a token");

    if (typeof deprel !== "string" && deprel != null)
      throw new NxError("deprel must be a string, null, or undefined");

    return this.heads.modify(head, deprel);
  }

  /**
   * Remove a head and its dependency relation.
   */
  removeHead(head: BaseToken): RelationItem|null {
    if (!(head instanceof BaseToken))
      throw new NxError("cannot add head unless it is a token");

    return this.heads.remove(head);
  }

  /**
   * Remove all heads
   */
  removeAllHeads(): void { return this.heads.clear(); }

  /**
   * Apply a callback to each of a token's heads
   */
  mapHeads<T>(callback: (item: RelationItem, index?: number) => T): T[] {
    // if (this.sent.options.enhanced) {
    return this.heads.map(callback);
    /*} else {
      return this.heads.first
        ? [ this.heads.first ].map(callback)
        : [].map(callback);
    }*/
  }

  /**
   * Apply a callback to each of token's dependents
   */
  mapDependents<T>(callback: (item: RelationItem, index?: number) => T): T[] {
    return this.dependents.map(callback);
  }

  /**
   * Get the head index for a given format
   */
  getHead(format?: string): string|null {
    if (!this.heads.length)
      return null;

    if (format === "CoNLL-U")
      return `${this.heads.first.token.indices.conllu}`;

    if (format === "CG3")
      return `${this.heads.first.token.indices.cg3}`;

    return `${this.heads.first.token.indices.absolute}`;
  }

  _getDeprel(): string|null {
    if (!this.heads.length)
      return null;

    return this.heads.first.deprel;
  }

  static getTokenIndex(token: BaseToken, format: string): ConlluIndex|Cg3Index|number|undefined {
    if (format === "CoNLL-U")
      return token.indices.conllu;

    if (format === "CG3")
      return token.indices.cg3;

    return token.indices.absolute;
  }

  static compareTokenIndices(x: BaseToken, y: BaseToken, format: string): number {
    if (BaseToken.getTokenIndex(x, format) < BaseToken.getTokenIndex(y, format))
      return -1;

    if (BaseToken.getTokenIndex(x, format) > BaseToken.getTokenIndex(y, format))
      return 1;

    return 0;
  }

  static sortTokenPair(x: BaseToken, y: BaseToken, format: string): [BaseToken, BaseToken] {
    const comparison = BaseToken.compareTokenIndices(x, y, format);
    if (comparison === -1)
      return [x, y];
    if (comparison === 1)
      return [y, x];
    throw new NxError("unable to sortTokenPair: tokens have the same index!");
  }

  _getDeps(format: string): string[] {
    if (!this.heads.length || !this.sent.options.enhanced)
      return [];

    return this.mapHeads(noop)
        .sort((x, y) => BaseToken.compareTokenIndices(x.token, y.token, format))
        .map((head) => {
          const headIndex = BaseToken.getTokenIndex(head.token, format);
          return head.deprel ? `${headIndex}:${head.deprel}`
                             : `${headIndex}`;
        });
  }

  /**
   * Mark this token as "empty" (aka "null")
   */
  setEmpty(isEmpty: boolean): void { this.isEmpty = isEmpty; }

  /**
   * Apply a callback to each of a token's analyses and subTokens
   */
  walk<T>(callback: (token: SubToken, index: number) => T): T[][]|null {
    let i = 0;
    if (this._analyses)
      return this._analyses.map(analysis => {
        return analysis._subTokens.map(
            subToken => { return callback(subToken, ++i); });
      });

    return null;
  }

  /**
   * Serialize a token to JSON format
   */
  serialize(): TokenSerial {
    let serial: TokenSerial = {

      uuid: this.uuid,
      form: this.form,
      index: this.indices.absolute,

      semicolon: this.semicolon,
      isEmpty: this.isEmpty,
      lemma: this.lemma,
      upostag: this.upostag,
      xpostag: this.xpostag,
      feats: this._feats,
      misc: this._misc,
      heads: this.mapHeads((head) => {
        return {
          index: head.token.indices.absolute,
          deprel: head.deprel,
        };
      }),
    };

    if (this._analyses && this._analyses.length)
      serial.analyses = this._analyses.map(analysis => {
        return {
          subTokens: analysis._subTokens.map(subToken => subToken.serialize()),
        };
      });

    serial = _.pick(serial, value => value !== undefined);

    return serial;
  }

  get isSuperToken(): boolean {
    return !!(this._analyses || []).reduce((total, analysis) => {
      return total += analysis._subTokens.length;
    }, 0);
  }

  get value(): string { return this.form || this.lemma; }

  // @ts-ignore: getter and setter should return same type
  get feats(): string|null|undefined {
    return this._feats_init ? this._feats.length ? this._feats.join("|") : null
                            : undefined;
  }

  set feats(feats: string[]|undefined) {
    if (feats === undefined)
      return;

    this._feats_init = true;
    this._feats = feats || [];
  }

  // @ts-ignore: getter and setter should return same type
  get misc(): string|null|undefined {
    return this._misc_init ? this._misc.length ? this._misc.join("|") : null
                           : undefined;
  }

  set misc(misc: string[]|undefined) { // [(serial.misc || ''), (serial.other ||
    // []).join('|')].join('|');
    if (misc === undefined)
      return;

    this._misc_init = true;
    this._misc = misc || [];
  }

  set other(other: string|string[]|undefined) {
    if (other === undefined)
      return;

    if (typeof other === "string")
      other = [other];

    this._misc_init = true;
    this._misc = (other || []).filter(thin);
  }
}
