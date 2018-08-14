'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../utils');
const nx = require('notatrix');


/**
 * Data structure to keep track of state and methods associated with a particular
 *  socket connection.
 *
 * NB: the data parameter should contain
 *  - username (optional): the GitHub account associated with this connection
 *  - id: user identifier, shared with the server
 *  - address: IP Address of the connection
 *  - index: the corpus index on this user's page
 *  - mouse: the x, y coordinates of the user's mouse (within #cy)
 *  - locked: a cytoscape selector to locate the node currently being edited
 *
 * @param {Object} data
 */
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

  /**
   * Helper function for `this::dom`, gives the index-part associated with a
   *  user in #chat.
   *
   * @return {String}
   */
  get viewing() {
    return this._viewing === null
      ? ''
      : ` (${this._viewing + 1}) `;
  }

  /**
   * Wrapper for setting the corpus index of the user.  Sanitizes input.
   *
   * @param {Number} index
   */
  set viewing(index) {
    index = parseInt(index);
    this._viewing = isNaN(index) ? null : index;
  }

  /**
   * Wrapper for setting the mosue position of the user.  Sanitizes input.
   *
   * @param {Object} pos { x: Number, y: Number }
   */
  setMouse(pos) {
    // if x and y not both given, don't save it
    this.mouse = (pos.x == null && pos.y == null) ? null : pos;
  }

  /**
   * Get a DOM object containing some of the user's data (this gets rendered in #chat)
   *
   * NB: this looks a bit messy, but it should have this structure:
   *  <span class="message-sender-info" name="{ id }">
   *    <i class="message-color-blob fa fa-circle" style="color: #{ color };" />
   *    <span class="message-sender-name" title="IP Address: { ip }">
   *      { name }
   *    </span>
   *    <span class="message-sender-viewing" title="Currently viewing">
   *      { viewing }
   *    </span>
   *  </span>
   *
   * @return {HTMLElement}
   */
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
