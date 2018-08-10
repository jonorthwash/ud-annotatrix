'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../utils');


class Chat {
  constructor(gui) {

    this.gui = gui;
    this.is_visible = true;
    this.is_minimized = false;

  }

  alert(message, users=[]) {

    const messages = $('#chat-messages'),
      alert = $('<span>')
        .addClass('message message-alert');

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

  sendMessage(collab) {

    const input = $('#chat-input'),
      message = input.val().trim();

    if (!message)
      return;

    collab.sendMessage(message);
    input.val('');

  }

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

  updateUser(user) {

    const dom = $(`.message-sender-info[name="${user.id}"]`);
    dom.find('.message-sender-name').text(user.name);
    dom.find('.message-sender-viewing').text(user.viewing);

  }

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

  bind() {

    const self = this;

    $('#chat-send').click(e => self.sendMessage(self.gui.app.collab));

    $('#chat-persist *, #chat-persist').click(e => {

      console.log($(e.target).attr('id'), $(e.target).is('#chat-close'))
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
