'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../utils');


/**
 * Abstraction to deal with interaction with #chat element and its descendents.
 *  Handles outgoing and incoming messages and alerts, event callbacks, and
 *  updating user spans.
 *
 * @param {GUI} gui reference to the parent
 */
class Chat {
  constructor(gui) {

    this.gui = gui;
    this.is_visible = true;
    this.is_minimized = false;

  }

  /**
   * Add an "alert" to the #chat.  Alert messages show up centrally aligned in
   *  the #chat.  This method also escapes '%u' strings in the message and
   *  replaces them with the `User::dom`.
   *
   * @param {String} message message to be alerted
   * @param {Array} users [User] list of users to be interleaved
   */
  alert(message, users=[]) {

    const messages = $('#chat-messages'),
      alert = $('<span>')
        .addClass('message message-alert');

    // do the interleaving
    message.split('%u').forEach((chunk, i) => {

      if (i && users[i-1])
        alert.append(users[i-1].dom())

      if (chunk)
        alert.append($('<span>')
          .addClass('content')
          .text(chunk));

    });

    messages
      .append(alert)
      .closest('div')
      .scrollTop(messages.prop('scrollHeight'));
  }

  /**
   * Send a message from the current user to the chat.  Also broadcasts the
   *  message to the other users.
   *
   * @param {CollaborationInterface} collab
   */
  sendMessage(collab) {

    // get the message
    const input = $('#chat-input'),
      message = input.val().trim();

    // don't send just whitespace
    if (!message)
      return;

    // broadcast
    const self = collab.self;
    this.gui.app.socket.broadcast('new message', {
      id: self.id,
      message: message,
    });

    // add it to #chat
    this.newMessage(self, message, true);

    // reset the input
    input.val('');
  }

  /**
   * Add a message to #chat with content `text` from `user`.  If `self == true`,
   *  then the message will be right-aligned.  Otherwise, it will be left-
   *  aligned.
   *
   * @param {User} user
   * @param {String} text
   * @param {Boolean} self (optional, default = `false`)
   */
  newMessage(user, text, self=false) {

    const messages = $('#chat-messages');
    const dom = $('<li>')
      .addClass('message')
      .addClass(self ? 'self' : 'other')
      .append($('<div>')
        .addClass('message-content')
        .append($('<div>')
          .addClass('message-text')
          .text(text)
        )
        .append($('<span>')
          .addClass('message-timestamp meta')
          .text((new Date()).toLocaleTimeString())
        )
      )
      .append($('<div>')
        .addClass('message-sender meta')
        .html(user.dom())
      );

    messages
      .append(dom)
      .closest('div')
      .scrollTop(messages.prop('scrollHeight'));
  }

  /**
   * Scan through #chat and update each `.message-sender-info` span for the given
   *  `user` to use the most recent values of `user.name` and `user.viewing`.
   *
   * @param {User} user
   */
  updateUser(user) {

    const dom = $(`.message-sender-info[name="${user.id}"]`);
    dom.find('.message-sender-name').text(user.name);
    dom.find('.message-sender-viewing').text(user.viewing);

  }

  /**
   * Force to redraw #chat based on our internal state.  Called every time there
   *  is a change.
   */
  refresh() {

    $('#chat')
      .css('display', this.is_visible ? 'flex' : 'none');

    $('#chat-expand')
      .css('display', this.is_minimized ? 'none' : 'flex');

    $('#chat-minimize i')
      .removeClass('fa-window-maximize fa-window-minimize')
      .addClass(this.is_minimized ? 'fa-window-maximize' : 'fa-window-minimize');

    $('#chat-available')
      .removeClass('red green')
      .addClass(this.gui.app.socket.initialized ? 'green' : 'red');

    $('#currently-online-number')
      .text(this.gui.app.collab.size);

  }

  /**
   * Bind callbacks.
   */
  bind() {

    const self = this;

    $('#chat-send').click(e => self.sendMessage(self.gui.app.collab));

    $('#chat-persist *, #chat-persist').click(e => {

      if ($(e.target).is('#chat-close'))
        return;

      self.is_minimized = !self.is_minimized;
      self.refresh();

    });

    $('#chat-close').click(e => {

      self.is_visible = false;
      self.refresh();

    });
  }
}


module.exports = Chat;
