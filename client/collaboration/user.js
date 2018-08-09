'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../utils');
const nx = require('notatrix');


class User {
  constructor(data) {

    this.name = data.username || 'anonymous';
    this.id = data.id;
    this.ip = data.address;
    this.color = nx.funcs.hashStringToHex(data.id);

    this._viewing = data.index;
    this.mouse = data.mouse;
    this.locked = data.locked;

  }

  get viewing() {
    return this._viewing === null
      ? ''
      : ` (${this._viewing + 1}) `;
  }

  set viewing(index) {
    index = parseInt(index);
    this._viewing = isNaN(index) ? null : index;
  }

  setMouse(pos) {
    this.mouse = (pos.x == null && pos.y == null) ? null : pos;
  }

  dom() {
    return $('<span>')
      .addClass('message-sender-info')
      .attr('name', this.id)
      .append($('<i>')
        .addClass('message-color-blob fa fa-circle')
        .css('color', '#' + this.color)
      )
      .append($('<span>')
        .addClass('message-sender-name')
        .text(this.name)
        .attr('title', 'IP Address: ' + this.ip)
      )
      .append($('<span>')
        .addClass('message-sender-viewing')
        .text(this.viewing)
        .attr('title', 'Currently viewing')
      );
  }
}


module.exports = User;
