"use strict";

import {NxBaseClass} from "./base-class";
import type {BaseToken} from "./base-token";

export interface RelationItem {
  token: BaseToken;
  deprel: string;
}

type PartnerKind = "heads"|"dependents";

export class RelationSet extends NxBaseClass {
  token: BaseToken;
  partner: PartnerKind;
  _items: RelationItem[];

  constructor(token: BaseToken, partner: PartnerKind) {
    super("RelationSet");
    this.token = token;
    this.partner = partner;
    this._items = [];
  }

  get length(): number { return this._items.length; }

  get first(): RelationItem|null { return this._items[0] || null; }

  map<T>(callback: (item: RelationItem, index?: number) => T): T[] { return this._items.map(callback); }

  has(token: BaseToken): boolean {
    let has = false;
    this.map(item => {
      if (item.token === token)
        has = true;
    });

    return has;
  }

  add(token: BaseToken, deprel: string, origin: boolean = true): boolean {
    if (this.has(token)) {
      this.modify(token, deprel);
      return false;
    }

    this._items.push({
      token: token,
      deprel: deprel,
    });

    if (origin)
      (token[this.partner] as RelationSet).add(this.token, deprel, false);

    return true;
  }

  modify(token: BaseToken, deprel: string, origin: boolean = true): boolean {
    if (!this.has(token))
      return false;

    let ret;
    this.map(item => {
      if (item.token === token) {
        ret = item.deprel !== deprel;
        item.deprel = deprel;
      }
    });

    if (origin)
      token[this.partner].modify(this.token, deprel, false);

    return ret;
  }

  remove(token: BaseToken, origin: boolean = true): RelationItem|null {
    let at = -1;

    this.map((item, i) => {
      if (item.token === token)
        at = i;
    });

    if (at === -1)
      return null;

    const removed = this._items.splice(at, 1)[0];

    if (origin)
      token[this.partner].remove(this.token);

    return removed || null;
  }

  clear(origin: boolean = true): void {
    this.map(item => {
      if (origin)
        item.token[this.partner].remove(this.token)
    });
    this._items = [];
  }
}
