'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../utils');


class Menu {
  constructor(gui) {

    this.gui = gui;
    this.is_visible = false;

  }

  bind() {

    const self = this;

    $('#content').click(e => {

      const isDescendent = !!$(e.target).closest('#dropdown-container').length;
      if (isDescendent)
        return;

      self.is_visible = false;
      self.refresh();

    });

    $('#btnMenuDropdown').click(e => {

      self.is_visible = !self.is_visible;
      self.refresh();

    });

    $('#btnPrevSentence').click(e => self.gui.app.corpus.prev());
    $('#btnNextSentence').click(e => self.gui.app.corpus.next());
    $('#current-sentence').blur(e => {

      const index = parseInt($('current-sentence').val()) - 1;
      self.gui.app.corpus.index = index;

    });
    $('#btnRemoveSentence').click(e => self.gui.app.corpus.removeSentence());
    $('#btnAddSentence').click(e => self.gui.app.corpus.insertSentence());

    $('.pin').click(e => {

      const name = $(e.target).closest('.dropdown-group-item').attr('name');

      if (self.gui.config.pinned_menu_items.has(name)) {
        self.gui.config.pinned_menu_items.delete(name);
      } else {
        self.gui.config.pinned_menu_items.add(name);
      }

      self.gui.save();
      self.refresh();
    });

    $('[name="chat"]').click(e => {

      const chat = self.gui.chat;
      chat.is_visible = !chat.is_visible;

      chat.refresh();
    })

    $('[name="logout"]').click(e => {
      utils.link(`/logout?treebank_id=${utils.getTreebankId()}`, '_self');
    });
    $('[name="login"]').click(e => {
      utils.link(`/oauth/login?treebank_id=${utils.getTreebankId()}`, '_self');
    });
    $('[name="manage-repos"]').click(e => {
      utils.link('/repos');
    });
    $('[name="manage-permissions"]').click(e => {
      utils.link('/permissions');
    });

    $('[name="save-corpus"]').click(e => {
      if (!$(e.target).is('.pin'))
        self.gui.app.save();
    });
    $('[name="upload-file"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        self.gui.modals.uploadFile.show();
    });
    $('[name="upload-url"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        self.gui.modals.uploadURL.show();
    });
    $('[name="download-corpus"]').click(e => {
      if (!$(e.target).is('.pin'))
        self.gui.app.download();
    });
    $('[name="discard-corpus"]').click(e => {
      if ($(e.target).is('.pin'))
        return;

      const response = confirm('Do you want to clear the corpus (remove all sentences)?');
      if (!response)
        return;

      self.gui.app.discard();
    });

    $('[name="export-as-latex"]').click(e => {
      if (!$(e.target).is('.pin'))
        utils.export.latex(self.gui.app);
    });
    $('[name="export-as-png"]').click(e => {
      if (!$(e.target).is('.pin'))
        utils.export.png(self.gui.app);
    });
    $('[name="export-as-svg"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        utils.export.svg(self.gui.app);
    });

    $('#btnUndo').click(e => self.gui.app.undoer.undo());
    $('#btnRedo').click(e => self.gui.app.undoer.redo());

    $('[name="show-labels"]').click(e => {
      if ($(e.target).is('.pin'))
        return;

      self.gui.config.is_label_bar_visible = !self.gui.config.is_label_bar_visible;
      self.gui.refresh();
    });
    $('[name="show-help"]').click(e => {
      if (!$(e.target).is('.pin'))
        utils.link('/help', '_self');
    });
    $('[name="show-settings"]').click(e => {
      if (!$(e.target).is('.pin'))
        utils.link('/settings?treebank_id=' + utils.getTreebankId(), '_self');
    });
    $('[name="show-table"]').click(e => {
      const target = $(e.target);
      if (target.is('.pin') || target.closest('a').hasClass('disabled'))
        return;

      self.gui.config.is_table_visible = !self.gui.config.is_table_visible;
      self.gui.refresh();
    });

    $('#btnToggleTextarea').click(e => {

      self.gui.config.is_textarea_visible = !self.gui.config.is_textarea_visible;
      self.gui.refresh();

    });

    // tab converters
    $('.format-tab').click(e => {

      const target = $(e.target);

      if (target.hasClass('disabled') || target.hasClass('fa'))
        return;

      const corpus = self.gui.app.corpus;

      if (corpus.format === target.attr('name'))
        return;

      if (!corpus.isParsed)
        corpus.parse(corpus.unparsed);

      corpus.format = target.attr('name');
      self.gui.refresh();

    });
  }

  refresh() {

    const config = this.gui.config;

    // internals

    $('.btn')
      .removeClass('disabled')
      .prop('disabled', false);

    $('#dropdown-container .dropdown-toggle')
      .removeClass('open');
    if (this.is_visible)
      $('#dropdown-container .dropdown-toggle').addClass('open');

    $('#dropdown-container .dropdown-content')
      .removeClass('menu-show menu-hidden')
      .addClass(this.is_visible ? 'menu-show' : 'menu-hidden');

    $('.pinnable')
      .removeClass('pinned')
      .addClass('unpinned');
    config.pinned_menu_items.forEach(name => {

      $(`.pinnable[name="${name}"]`)
        .removeClass('unpinned')
        .addClass('pinned');

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

    // corpus navigation

    const corpus = this.gui.app.corpus,
      indices = corpus.getIndices();

    $('#current-sentence').val(indices.current);
    $('#total-sentences').text(indices.total);
    if (!corpus.index)
      $('#btnPrevSentence').addClass('disabled');
    if (corpus.index === (corpus._corpus.filtered.length || corpus.length) - 1)
      $('#btnNextSentence').addClass('disabled');

    // other buttons

    const server_running = this.gui.app.server.is_running;
    $('[name="upload-file"]')
      .toggleClass('disabled', !server_running)
      .prop('disabled', !server_running);

    $('.export-button')
      .toggleClass('disabled', !this.gui.app.graph.length);
    $('[name="export-as-svg"]')    // TODO: until SVG is fixed
      .addClass('disabled');
    $('[name="show-table"]')
      .toggleClass('disabled', corpus.format !== 'CoNLL-U');

    $('#btnUndo').prop('disabled', !this.gui.app.undoer.hasUndo());
    $('#btnRedo').prop('disabled', !this.gui.app.undoer.hasRedo());



    // deactive all the other format tabs
    //   NB: when unparsed, none will be active
    $('.nav-link')
      .removeClass('active')
      .filter(`[name="${corpus.format}"]`)
      .toggleClass('active', corpus.isParsed);

    $('#btnToggleTextarea .fa')
      .removeClass('fa-chevron-down fa-chevron-up');

    if (config.is_textarea_visible) {

      $('#data-container').show();
      $('#top-buttons-container').removeClass('extra-space');
      $('.format-tab').show();

      $('#btnToggleTable')
        .show()
        .find('.fa')
        .removeClass('fa-table fa-code')
        .addClass(config.is_table_visible ? 'fa-code' : 'fa-table')
        .toggleClass('disabled', corpus.format !== 'CoNLL-U')
        .prop('disabled', corpus.format !== 'CoNLL-U')
        .show();

      $('#btnToggleTextarea .fa').addClass('fa-chevron-up');

    } else {

      $('#data-container').hide();
      $('#top-buttons-container').addClass('extra-space');
      $('.format-tab').not('.active').hide();
      $('#btnToggleTable').hide();
      $('#btnToggleTextarea .fa').addClass('fa-chevron-down');
    }

  }
}


module.exports = Menu;
