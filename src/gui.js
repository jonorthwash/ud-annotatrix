'use strict';

const $ = require('jquery');

const convert = require('./convert');
const corpus = require('./corpus');
const funcs = require('./funcs');
const errors = require('./errors');
const setupUndos = require('./undo-manager');
const table = require('./table');

const KEYS = {
  DELETE: 46,
  BACKSPACE: 8,
  ENTER: 13,
  ESC: 27,
  TAB: 9,
  RIGHT: 39,
  LEFT: 37,
  UP: 38,
  DOWN: 40,
  MINUS: 173,
  MINUS_: 189,
  EQUALS: 61,
  EQUALS_: 187,
  SHIFT: 16,
  CTRL: 17,
  OPT: 18,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  META: 224,
  D: 68,
  I: 73,
  J: 74,
  K: 75,
  M: 77,
  P: 80,
  R: 82,
  S: 83,
  X: 88,
  Y: 89,
  Z: 90,
  0: 48
};
const toggle = {
  table: (event) => {
    gui.is_table_view = !gui.is_table_view;
    gui.update();
  },

  tableColumn: (event) => {

    const target = $(event.target),
      col = target.attr('col-id');

    gui.column_visible(col, !gui.column_visible(col));
    target.toggleClass('column-hidden')
      .find('i')
        .toggleClass('fa-angle-double-right')
        .toggleClass('fa-angle-double-left');

    $(`td[col-id=${col}]`)
      .css('visibility', gui.column_visible(col) ? 'visible' : 'hidden');

    gui.update();
  },

  textarea: (event) => {

    $('#btnToggleTextarea i')
			.toggleClass('fa-chevron-up')
			.toggleClass('fa-chevron-down')
    gui.is_textarea_visible = !gui.is_textarea_visible;

    gui.update();
  },

  rtl: (event) => {

    $('#RTL .fa')
			.toggleClass('fa-align-right')
			.toggleClass('fa-align-left');
		gui.is_ltr = !gui.is_ltr;

    gui.update();
  },

  vertical: (event) => {

    $('#vertical .fa').toggleClass('fa-rotate-90');
    gui.is_vertical = !gui.is_vertical;

    gui.update();
  },

  enhanced: (event) => {

    $('#enhanced .fa')
			.toggleClass('fa-tree')
			.toggleClass('fa-magic');
    gui.is_enhanced = !gui.is_enhanced;

    gui.update();
  }
}


class GUI {
  constructor(mgr) {

    this.keys = KEYS;
    this.toggle = toggle;

    this.is_textarea_visible = true;
    this.is_vertical = false;
    this.is_ltr = true;
    this.is_enhanced = false;

    this.pan = this.pan || null;
    this.zoom = this.zoom || null;
    this.graph_disabled = false;
    this.intercepted = false;
    this.moving_dependency = false;
    this.editing = null;

    this.inBrowser = funcs.inBrowser();
    setupUndos();

  }

  update() {
    if (!this.inBrowser)
      return;

    // textarea
    $('#text-data').val(manager.sentence);

    // navigation buttons
    $('.btn').removeClass('disabled');
    $('#total-sentences').text(manager.length);
    $('#current-sentence').val(manager.index + 1);
    if (!manager.index)
      $('#btnPrevSentence').addClass('disabled');
    if (manager.index === manager.length - 1)
      $('#btnNextSentence').addClass('disabled');
    if (!server.is_running)
      $('#btnUploadCorpus').addClass('disabled');

    $('.nav-link').removeClass('active').show();
    switch (manager.format) {
      case ('Unknown'):
        $('.nav-link').hide();
        $('#tabOther').addClass('active').show().text(manager.format);
        break;
      case ('CoNLL-U'):
        $('#tabConllu').addClass('active');
        $('#tabOther').hide();
        break;
      case ('CG3'):
        $('#tabCG3').addClass('active');
        $('#tabOther').hide();
        break;
      case ('plain text'):
        $('#tabText').hide(); // NOTE: no break here
      default:
        $('#tabOther').addClass('active').show().text(manager.format);
        break;
    }

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

    graph.update();
  }

  read(id) {
    if (!this.inBrowser)
      return;

    switch (id) {
      case ('text-data'):
      case ('current-sentence'):
        return $(`#${id}`).val();
      default:
        throw new TypeError(`unable to read "${id}"`);
    }
  }

  bind() {

    $('#btnPrevSentence').click(e => {
      manager.prev();
    });
    $('#btnNextSentence').click(e => {
      manager.next();
    });
    $('#current-sentence').blur(e => {
      const index = parseInt(this.read('current-sentence')) - 1;
      manager.index = index;
    });
    $('#btnRemoveSentence').click(e => {
      manager.removeSentence()
    });
    $('#btnAddSentence').click(e => {
      manager.insertSentence('');
    });

    $('#btnUploadCorpus').click(corpus.upload);
    $('#btnExportCorpus').click(corpus.export);
    //$('#btnSaveServer').click(saveOnServer);
    $('#btnDiscardCorpus').click(corpus.clear);
    $('#btnPrintCorpus').click(corpus.print);

    $('#btnHelp').click(e => {
      window.open('help.html', '_blank').focus();
    });
    $('#btnSettings').click(e => {
      throw new errors.NotImplementedError('show settings not implemented');
    });

    $('#tabText').click(e => {
      manager.parse(convert.to.plainText(manager.sentence));
    });
    $('#tabConllu').click(e => {
      manager.parse(convert.to.conllu(manager.sentence));
    });
    $('#tabCG3').click(e => {
      manager.parse(convert.to.cg3(manager.sentence));
    });

    $('#btnToggleTable').click(this.toggle.table);
    $('#btnToggleTextarea').click(this.toggle.textarea);
    $('.thead-default th').click(this.toggle.tableColumn);
    $('#RTL').click(this.toggle.rtl);
    $('#vertical').click(this.toggle.vertical);
    $('#enhanced').click(this.toggle.enhanced);
    return;

    $('#current-sentence').keyup(onKeyupInTextarea);
    $('#text-data').keyup(onEditTextData);

    // onkeyup is a global variable for JS runtime
    onkeyup = onKeyupInDocument;

    // direct graph-editing stuff
    $('#edit').keyup(onKeyupInEditLabel);

    // prevent accidentally leaving the page
    window.onbeforeunload = () => {
      // DEBUG: uncomment this line for production
      // return 'Are you sure you want to leave?';
    };

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
    throw new errors.NotImplementedError();
  }
  zoomOut() {
    throw new errors.NotImplementedError();
  }

  onEnter(event) {
    console.log('on enter')
  }
}



module.exports = GUI;
