'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../utils');


class Menu {
  constructor(gui) {

    this.gui = gui;
    this.is_menu_visible = false;
    this.is_collab_visible = false; // TODO: move this to /client/collab ?

  }

  bind() {

    const self = this;

    $('#btnMenuDropdown').click(e => {

      self.is_menu_visible = !self.is_menu_visible;
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

    $('#toggle-collab').click(e => {

      self.is_collab_visible = !self.is_collab_visible;
      self.refresh();

    });

    $('.pin').click(e => {

      const name = $(e.target).closest('.dropdown-group-item').attr('name'),
        pinned = self.gui.config.pinned_menu_items,
        index = pinned.indexOf(name);

      if (index > -1) {
        pinned.splice(index, 1);
      } else {
        pinned.push(name);
      }

      self.gui.save();
      self.refresh();
    });

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
    $('[name="upload-corpus"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        self.gui.modals.upload.show();
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

      if ($(e.target).hasClass('disabled'))
        return;

      if (!self.gui.app.corpus.parsed)
        self.gui.app.corpus.parse($('#text-data').val());

      self.gui.app.corpus.current._meta.format = $(e.target).attr('name');
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
    if (this.is_menu_visible)
      $('#dropdown-container .dropdown-toggle').addClass('open');

    $('#dropdown-container .dropdown-content')
      .removeClass('menu-show menu-hidden')
      .addClass(this.is_menu_visible ? 'menu-show' : 'menu-hidden');

    $('#toggle-collab #currently-online-list')
      .removeClass('menu-show menu-hidden')
      .addClass(this.is_collab_visible ? 'menu-show' : 'menu-hidden');

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

    if (!this.gui.app.server.is_running)
      $('[name="upload-corpus"]')
        .addClass('disabled')
        .prop('disabled', true);

    $('.export-button')
      .toggleClass('disabled', !this.gui.app.graph.length);
    $('[name="export-as-svg"]')    // TODO: until SVG is fixed
      .addClass('disabled');
    $('[name="show-table"]')
      .toggleClass('disabled', corpus.format !== 'CoNLL-U');

    //$('#btnUndo').prop('disabled', !utils.undoManager.hasUndo());
    //$('#btnRedo').prop('disabled', !utils.undoManager.hasRedo());



    // deactive all the other format tabs
    //   NB: when unparsed, none will be active
    $('.nav-link')
      .removeClass('active')
      .filter(`[name="${corpus.format}"]`)
      .toggleClass('active', corpus.parsed);

    // show our warnings
    $('.tab-warning').hide();
    if (corpus.conversionLosses.length)
      $(`.format-tab[name="${corpus.format}"] .tab-warning`)
        .show()
        .attr('title', `Unable to encode ${corpus.conversionLosses.join(', ')}`);

    $('#btnToggleTextarea .fa')
      .removeClass('fa-chevron-down fa-chevon-up');

    if (config.is_textarea_visible) {

      $('#data-container').show();
      $('#top-buttons-container').removeClass('extra-space');

      $('#btnToggleTable .fa')
        .toggleClass('fa-code', config.is_table_visible)
        .toggleClass('disabled', corpus.format !== 'CoNLL-U')
        .prop('disabled', corpus.format !== 'CoNLL-U')
        .show();

      $('#btnToggleTextarea .fa').addClass('fa-chevron-up');

      // show our errors
      $('.tab-error').hide();
      _.each(corpus.conversionErrors, (message, format) => {
        $(`.format-tab[name="${format}"]`)
          .addClass('disabled')
          .find(`.tab-error`)
            .show()
            .attr('title', message);
      });

    } else {

      $('#data-container').hide();
      $('#top-buttons-container').addClass('extra-space');
      $('.nav-link').not('.active').hide();
      $('#btnToggleTable').hide();
      $('#btnToggleTextarea .fa').addClass('fa-chevron-down');
    }

  }
}


module.exports = Menu;
