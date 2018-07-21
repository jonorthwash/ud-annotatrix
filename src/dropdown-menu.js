'use strict';

const _ = require('underscore');
const $ = require('jquery');
const user = require('./user');
const funcs = require('./funcs');

class Menu {
  constructor(gui) {
    this.gui = gui;
    this.reset();
    this.bind();
  }

  reset() {

    this.is_visible = false;
    this.pinned = {
      login: false,
      'manage-permissions': false,

      'save-corpus': false,
      'upload-corpus': false,
      'download-corpus': false,
      'discard-corpus': false,

      'export-as-latex': false,
      'export-as-png': false,
      'export-as-svg': false,

      'show-help': true,
      'show-settings': false,
      'show-table': false
    };
  }

  bind() {

    $('#btnMenuDropdown').click(e => this.toggle(e));
    $('.dropdown-group-item .pin').click(e => this.togglePinned(e));

  }

  update() {

    $('#dropdown-container .dropdown-toggle')
      .removeClass('open');
    if (this.is_visible) {
      $('#dropdown-container .dropdown-toggle').addClass('open');
    }

    $('#dropdown-container .dropdown-content')
      .removeClass('menu-show menu-hidden')
      .addClass(this.is_visible ? 'menu-show' : 'menu-hidden');

    $('.dropdown-group-item.pinnable, .btn.pinnable').removeClass('pinned unpinned');
    _.each(this.pinned, (bool, name) => {
      $(`.dropdown-group-item[name="${name}"]`).addClass(bool ? 'pinned' : 'unpinned');
      $(`.btn.pinnable[name="${name}"]`).addClass(bool ? 'pinned' : 'unpinned');
    });

    $('.btn-group .btn').css('border-radius', '0');
    $('.btn-group').each((i, group) => {
      group = $(group);

      let visible = false,
        first = null,
        last = null;

      group.children().each((j, btn) => {
        btn = $(btn);

        if (!btn.hasClass('unpinned') && btn.hasClass('btn')) {
          first = first || btn;
          last = btn;
        }

        if (btn.hasClass('pinnable')) {
          visible = visible || btn.hasClass('pinned');
        } else {
          visible = true;
        }
      });

      group.css('display', visible ? 'inline-flex' : 'none');
      if (first)
        first
          .css('border-top-left-radius', '5px')
          .css('border-bottom-left-radius', '5px');
      if (last)
        last
          .css('border-top-right-radius', '5px')
          .css('border-bottom-right-radius', '5px');
    });

    $('#dropdown-user').children().not(':first-child').detach();
    if (user.get()) {
      $('#dropdown-user').append(
        $('<a>')
          .addClass('dropdown-group-item login not-logged-in')
          .attr('href', `#`)
          .attr('name', 'logout')
          .click(e => user.logout())
          .append(
            $('<span>')
              .addClass('dropdown-group-item-name')
              .text(`Logout (${user.get()})`)
              .prepend(
                $('<i>')
                  .addClass('fa fa-github')
              )
          )
      ).append(
        $('<a>')
          .addClass('dropdown-group-item permissions')
          .attr('href', '#')
          .attr('name', 'manage-permissions')
          .append(
            $('<span>')
              .addClass('dropdown-group-item-name')
              .text('Manage permissions')
              .prepend(
                $('<i>')
                  .addClass('fa fa-users')
              )
          )
      )
    } else {
      $('#dropdown-user').append(
        $('<a>')
          .addClass(`dropdown-group-item login not-logged-in ${server.is_running ? '' : 'disabled'}`)
          .attr('href', '#')
          .attr('name', 'login')
          .prop('disabled', !server.is_running)
          .click(e => user.login())
          .append(
            $('<span>')
              .addClass('dropdown-group-item-name')
              .text('Login to GitHub')
              .prepend(
                $('<i>')
                  .addClass('fa fa-github')
              )
          )
      )
    }
    /*
    <a class="dropdown-group-item login not-logged-in" href="#" name="login">
      <span class="dropdown-group-item-name">
        <i class="fa fa-github"></i>
        Login to GitHub
      </span>
      <i></i>
    </a>
    <a class="dropdown-group-item permissions" href="#" name="manage-permissions">
      <span class="dropdown-group-item-name">
        <i class="fa fa-users"></i>
        Manage permissions
      </span>
      <i></i>
    </a>
    */
  }

  toggle(event) {
    this.is_visible = !this.is_visible;
    this.gui.update();
  }

  togglePinned(event) {
    const name = $(event.target).closest('.dropdown-group-item').attr('name');

    this.pinned[name] = !this.pinned[name];
    this.gui.update();
  }

  get state() {
    return {
      is_visible: this.is_visible,
      pinned:     this.pinned
    };
  }

  set state(state) {

    this.reset();
    if (!state)
      return;

    if (state)
      this.pinned = state.pinned || this.pinned;

  }
}

module.exports = Menu;
