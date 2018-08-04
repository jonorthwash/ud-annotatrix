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
    this.collab_visible = false;
    this.pinned = {
      login: false,
      'manage-permissions': false,
      collab: true,

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
    $('#toggle-collab').click(e => this.toggleCollab(e));
    $('.dropdown-group-item .pin').click(e => this.togglePinned(e));

    $('.dropdown-group-item[name="logout"]').click(e => user.logout());
    $('.dropdown-group-item[name="login"]').click(e => user.login());
    $('.dropdown-group-item[name="manage-repos"]').click(e => user.manage.repos());
    $('.dropdown-group-item[name="manage-permissions"]').click(e => user.manage.permissions());

  }

  update() {

    $('#dropdown-container .dropdown-toggle')
      .removeClass('open');
    if (this.is_visible)
      $('#dropdown-container .dropdown-toggle').addClass('open');

    $('#dropdown-container .dropdown-content')
      .removeClass('menu-show menu-hidden')
      .addClass(this.is_visible ? 'menu-show' : 'menu-hidden');

    $('#toggle-collab #currently-online-list')
    .removeClass('menu-show menu-hidden')
    .addClass(this.collab_visible ? 'menu-show' : 'menu-hidden');

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
  }

  toggle(event) {
    this.is_visible = !this.is_visible;
    this.gui.update();
  }

  toggleCollab(event) {
    this.collab_visible = !this.collab_visible;
    this.gui.update();
  }

  togglePinned(event) {
    const name = $(event.target).closest('.dropdown-group-item').attr('name');

    this.pinned[name] = !this.pinned[name];
    this.gui.update();
  }

  get state() {
    return this.pinned;
  }

  set state(state) {

    this.reset();
    _.each(state, (bool, name) => {
      this.pinned[name] = bool;
    });
    
  }
}

module.exports = Menu;
