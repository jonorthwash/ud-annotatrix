'use strict';

const $ = require('jquery');

const funcs = require('./funcs');
const errors = require('./errors');

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

class GUI {
  constructor(mgr) {
    this.mgr = mgr;

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
  }

  update() {
    if (!this.inBrowser)
      return;

    // textarea
    $('#text-data').val(this.mgr.sentence);

    // navigation buttons
    $('#total-sentences').text(this.mgr.length);
    $('#current-sentence').val(this.mgr.index + 1);
    $('#btnPrevSentence').attr('disabled', !!this.mgr.index);
    $('#btnNextSentence').attr('disabled', (this.mgr.index === this.mgr.length));

    $('.nav-link').removeClass('active').show();
    switch (this.mgr.format) {
      case ('Unknown'):
        $('.nav-link').hide();
        $('#tabOther').addClass('active').show().text(this.mgr.format);
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
        $('#tabOther').addClass('active').show().text(this.mgr.format);
        break;
    }

    if (this.mgr.format !== 'CoNLL-U')
        this.is_table_view = false;

    if (this.is_table_view) {
        $('#btnToggleTable i').removeClass('fa-code');
        $('#text-data').hide();
        $('#table-data').show();
        buildTable();
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

    this.mgr.graph.update();
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
      this.mgr.prev();
    });
    $('#btnNextSentence').click(e => {
      this.mgr.next();
    });
    $('#current-sentence').blur(e => {
      const index = parseInt(this.read('current-sentence')) - 1;
      this.mgr.index = index;
    });
    $('#btnRemoveSentence').click(e => {
      this.mgr.removeSentence()
    });
    $('#btnAddSentence').click(e => {
      this.mgr.insertSentence('');
    });

    return;

    $('#btnUploadCorpus').click(uploadCorpus);
    $('#btnExportCorpus').click(exportCorpus);
    //$('#btnSaveServer').click(saveOnServer);
    $('#btnDiscardCorpus').click(clearCorpus);
    $('#btnPrintCorpus').click(printCorpus);

    $('#btnHelp').click(showHelp);
    $('#btnSettings').click(showSettings);

    $('#tabText').click(e => {
      convertText(convert2PlainText); });
    $('#tabConllu').click(e => {
      convertText(convert2Conllu); });
    $('#tabCG3').click(e => {
      convertText(convert2CG3); });

    $('#btnToggleTable').click(toggleTable);
    $('#btnToggleTextarea').click(toggleTextarea);

    $('#text-data').keyup(onEditTextData);
    $('.thead-default th').click(toggleTableColumn);

    $('#RTL').click(toggleRTL);
    $('#vertical').click(toggleVertical);
    $('#enhanced').click(toggleEnhanced);

    $('#current-sentence').keyup(onKeyupInTextarea);

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
    return this.mgr.current.is_table_view;
  }
  set is_table_view(bool) {
    if (typeof bool === 'boolean' && this.mgr.format === 'CoNLL-U')
      this.mgr.current.is_table_view = bool;

    return this.mgr.current.is_table_view;
  }

  column_visible(col, bool) {
    if (typeof bool === 'boolean')
      this.mgr.current.column_visibilities[col] = bool;

    return this.mgr.current.column_visibilities[col];
  }

  zoomIn() {
    throw new errors.NotImplementedError();
  }
  zoomOut() {
    throw new errors.NotImplementedError
  }

}



module.exports = GUI;
