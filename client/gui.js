'use strict';

const $ = require('jquery');
const _ = require('underscore');

const Menu = require('./dropdown-menu');
const funcs = require('./funcs');
const errors = require('./errors');
const setupUndos = require('./undo-manager');
const table = require('./table');
const storage = require('./local-storage');
const keys = require('./keyboard');


var pressed = {}; // used for onCtrlKeyup

class GUI {
  constructor() {

    this.is_textarea_visible = true;
    this.are_labels_visible = true;
    this.is_vertical = false;
    this.is_ltr = true;
    this.readonly = false;

    this.pan = this.pan || null;
    this.zoom = this.zoom || null;
    this.graph_disabled = false;
    this.intercepted = false;
    this.moving_dependency = false;
    this.editing = null;

    this.inBrowser = funcs.inBrowser();

    if (this.inBrowser) {
      setupUndos();
      undoManager.setCallback(() => this.update());

      this.keys = keys;
      this.menu = new Menu(this);
      this.modals = require('./modals/index');
    }

    this.toggle = {
      dropdown: event => this.menu.toggle(event),
      pin: event => this.menu.togglePinned(event),

      table: (event) => {
        this.is_table_view = !this.is_table_view;
        this.update();
      },

      tableColumn: (event) => {

        const target = $(event.target),
          col = target.attr('col-id');

        this.column_visible(col, !this.column_visible(col));
        target.toggleClass('column-hidden')
          .find('i')
            .toggleClass('fa-angle-double-right')
            .toggleClass('fa-angle-double-left');

        $(`td[col-id=${col}]`)
          .css('visibility', this.column_visible(col) ? 'visible' : 'hidden');

        this.update();
      },

      textarea: (event) => {

        $('#btnToggleTextarea i')
    			.toggleClass('fa-chevron-up')
    			.toggleClass('fa-chevron-down')
        this.is_textarea_visible = !this.is_textarea_visible;

        this.update();
      },

      rtl: (event) => {

        $('#RTL .fa')
    			.toggleClass('fa-align-right')
    			.toggleClass('fa-align-left');
    		this.is_ltr = !this.is_ltr;

        this.update();
      },

      vertical: (event) => {

        $('#vertical .fa').toggleClass('fa-rotate-90');
        this.is_vertical = !this.is_vertical;

        this.update();
      },

      enhanced: (event) => {

        if (this.is_enhanced) {
          manager.current._nx.unenhance();
        } else {
          manager.current._nx.enhance();
        }

        this.is_enhanced = manager.current._nx.options.enhanced;

        $('#enhanced .fa')
          .removeClass('fa-tree fa-magic')
          .addClass(this.is_enhanced ? 'fa-tree' : 'fa-magic')

        this.update();
      }
    }

  }

  get state() {
    return {

      menu:                this.menu ? this.menu.state : null,
      is_textarea_visible: this.is_textarea_visible,
      are_labels_visible:  this.are_labels_visible,
      is_vertical:         this.is_vertical,
      is_ltr:              this.is_ltr,
      readonly:            this.readonly,

      pan:  this.pan,
      zoom: this.zoom

    };
  }

  set state(state) {

    this.menu.state = state.menu;

    this.is_textarea_visible = state.is_textarea_visible,
    this.are_labels_visible  = state.are_labels_visible,
    this.is_vertical         = state.is_vertical;
    this.is_ltr              = state.is_ltr;
    this.readonly            = state.readonly;

    this.pan  = state.pan;
    this.zoom = state.zoom;

    this.update();
  }

  update() {
    if (!this.inBrowser)
      return;

    this.menu.update();

    // textarea
    $('#text-data')
      .removeClass('readonly')
      .val(manager.toString());

    // navigation buttons
    $('.btn, .dropdown-group-item')
      .removeClass('disabled')
      .prop('disabled', false);

    manager.updateFilter();
    $('#total-sentences').text(manager.totalSentences);
    $('#current-sentence').val(manager.currentSentence);
    if (!manager.index && (manager._filtered.length || manager.length))
      $('#btnPrevSentence').addClass('disabled');
    if (manager.index === (manager._filtered.length || manager.length) - 1)
      $('#btnNextSentence').addClass('disabled');

    if (!server.is_running)
      $('[name="upload-corpus"]')
        .addClass('disabled')
        .prop('disabled', true);
    if (manager.format !== 'CoNLL-U')
      $('[name="show-table"]')
        .addClass('disabled')
        .prop('disabled', true);

    // TODO: until SVG is fixed
    $('[name="export-as-svg"]').addClass('disabled').prop('disabled', true);

    $('#btnUndo').prop('disabled', !undoManager.hasUndo());
    $('#btnRedo').prop('disabled', !undoManager.hasRedo());

    $('.nav-link')
      .removeClass('active')
      .filter(`[name="${manager.format}"]`)
      .addClass('active');

    $('.tab-warning').hide();
    if (manager.current.conversion_warning)
      $(`.format-tab[name="${manager.current.format}"] .tab-warning`)
        .show()
        .attr('title', manager.current.conversion_warning);

    if (manager.format !== 'CoNLL-U')
      this.is_table_view = false;

    if (this.is_table_view) {
      $('#btnToggleTable i').removeClass('fa-code');
      $('#text-data').hide();
      $('#table-data').show();
      table.build();
    } else {
      $('#btnToggleTable i').addClass('fa-code');
      $('#text-data').show();
      $('#table-data').hide();
    }

    if (this.is_textarea_visible) {
      $('#data-container').show();
      $('#top-buttons-container').removeClass('extra-space');
      $('#btnToggleTable').show();
    } else {
      $('#data-container').hide();
      $('#top-buttons-container').addClass('extra-space');
      $('.nav-link').not('.active').hide();
      $('#btnToggleTable').hide();
    }

    $('#label-container')
      .css('display', this.are_labels_visible && this.is_textarea_visible
        ? 'flex'
        : 'none');

    try { // need this in case `cy` DNE
      this.zoom = cy.zoom();
      this.pan  = cy.pan();
    } catch (e) {
      this.zoom = null;
      this.pan  = null;
    }
    labeler.update();
    graph.update();
  }

  bind() {
    if (!this.inBrowser)
      return;

    $('#btnPrevSentence').click(e => manager.prev());
    $('#btnNextSentence').click(e => manager.next());
    $('#current-sentence').blur(e => {
      const index = parseInt($('current-sentence').val()) - 1;
      manager.index = index;
    });
    $('#btnRemoveSentence').click(e => manager.removeSentence());
    $('#btnAddSentence').click(e => manager.insertSentence());

    $('[name="save-corpus"]').click(e => {
      if (!$(e.target).is('.pin'))
        manager.save();
    });
    $('[name="upload-corpus"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        this.modals.upload.show();
    });
    $('[name="download-corpus"]').click(e => {
      if (!$(e.target).is('.pin'))
        manager.download();
    });
    $('[name="discard-corpus"]').click(e => {
      if ($(e.target).is('.pin'))
        return;

      const conf = confirm('Do you want to clear the corpus (remove all sentences)?');
      if (!conf) {
        log.info('corpus::clear(): not clearing corpus');
        return;
      }

      storage.clear();
      manager.reset();
    });

    $('[name="export-as-latex"]').click(e => {
      if (!$(e.target).is('.pin'))
        manager.export.latex();
    });
    $('[name="export-as-png"]').click(e => {
      if (!$(e.target).is('.pin'))
        manager.export.png();
    });
    $('[name="export-as-svg"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        manager.export.svg();
    });

    $('[name="show-labels"]').click(e => {
      if ($(e.target).is('.pin'))
        return;

      this.are_labels_visible = !this.are_labels_visible;
      this.update();
    });
    $('[name="show-help"]').click(e => {
      if (!$(e.target).is('.pin'))
        funcs.link('/help', '_self');
    });
    $('[name="show-settings"]').click(e => {
      if (!$(e.target).is('.pin'))
        funcs.link('/settings?treebank_id=' + funcs.getTreebankId(), '_self');
    });

    $('.format-tab').click(e => {

      manager.current.format = $(e.target).attr('name');
      this.update();

    });

    $('[name="show-table"]').click(e => {
      const target = $(e.target);
      if (!target.is('.pin') && !target.closest('a').hasClass('disabled'))
        this.toggle.table(e)
    });
    $('.thead-default th').click(e => this.toggle.tableColumn(e));
    $('#btnToggleTextarea').click(e => this.toggle.textarea(e));

    $('#label-clear-filter').click(e => {
      labeler.clearFilter();
      gui.update();
    });

    $('#RTL').click(e => this.toggle.rtl(e));
    $('#vertical').click(e => this.toggle.vertical(e));
    $('#enhanced').click(e => this.toggle.enhanced(e));

    $('.controls').click(e => $(':focus:not(#edit)').blur());
    window.onkeyup = e => keys.up(this, e);
    window.onkeydown = e => keys.down(this, e);
    window.onbeforeunload = e => manager.save();

  }

  get is_table_view() {
    return manager.current.is_table_view;
  }
  set is_table_view(bool) {

    manager.current.is_table_view = false;
    if (typeof bool === 'boolean' && manager.format === 'CoNLL-U')
      manager.current.is_table_view = bool;

    return manager.current.is_table_view;
  }

  column_visible(col, bool) {
    if (typeof bool === 'boolean')
      manager.current.column_visibilities[col] = bool;

    return manager.current.column_visibilities[col];
  }

  zoomIn() {
    cy.zoom(this.zoom * 1.1);
    this.update();

    return this;
  }
  zoomOut() {
    cy.zoom(this.zoom / 1.1);
    this.update();

    return this;
  }

}


function mergeNodes(direction) {

  // the highlighted one is the "major" token
  const major = cy.$('node.form.merge').data().analysis;

  // find the "minor" token by moving either one clump to the left or right
  const minorClump = major.clump
    + (direction === 'left' && gui.is_ltr || direction === 'right' && !gui.is_ltr
      ? -1 : 1);

  // iterate tokens until we find a matching candidate
  let minor = null;
  major.sentence.forEach(token => {
    if (token.analysis.clump === minorClump)
      minor = token.analysis;
  });

  // do the merge
  if (major && minor)
    major.token.mergeWith(minor.token);

  // clean up
  cy.$('node.form.merge').removeClass('merge');
  gui.update();
}

module.exports = GUI;
