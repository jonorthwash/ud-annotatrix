"use strict";

const _ = require("underscore");

const utils = require("../utils");
const NxBaseClass = require("./base-class");

class RelationSet extends NxBaseClass {
  constructor(token, partner) {
    super("RelationSet");
    this.token = token;
    this.partner = partner;
    this._items = [];
  }

  get length() { return this._items.length; }

  get first() { return this._items[0] || null; }

  map(callback) { return this._items.map(callback); }

  has(token) {
    let has = false;
    this.map(item => {
      if (item.token === token)
        has = true;
    });

    return has;
  }

  add(token, deprel, origin = true) {
    if (this.has(token)) {
      this.modify(token, deprel);
      return false;
    }

    this._items.push({
      token: token,
      deprel: deprel,
    });

    if (origin)
      token[this.partner].add(this.token, deprel, false);

    return true;
  }

  modify(token, deprel, origin = true) {
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

  remove(token, origin = true) {
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

  clear(origin = true) {
    this.map(item => {
      if (origin)
        item.token[this.partner].remove(this.token)
    });
    this._items = [];
  }
}

module.exports = RelationSet;
