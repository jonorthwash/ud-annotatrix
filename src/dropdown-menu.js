'use strict';

const _ = require('underscore');
const $ = require('jquery');

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

      'export-as-png': false,
      'export-as-latex': false,

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
    if (state.is_visible !== undefined)
      this.is_visible = state.pinned;
    if (state.pinned !== undefined)
      this.pinned = state.pinned;

  }
}

module.exports = Menu;
