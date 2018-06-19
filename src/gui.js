'use strict';

const $ = require('jquery');

const funcs = require('./funcs');
const errors = require('./errors');

class GUI {
  constructor(mgr) {
    this.mgr = mgr;

    this.is_textarea_visible = true;
    this.is_vertical = false;
    this.is_ltr = true;
    this.is_enhanced = false;
    this._is_table_view = false;

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
    
  }

  get is_table_view() {
    return this.current._is_table_view;
  }
  set is_table_view(bool) {
    if (typeof bool === 'boolean' && this.mgr.format === 'CoNLL-U')
      this.current._is_table_view = bool;

    return this.current._is_table_view;
  }

  column_visible(col, bool) {    if (typeof bool === 'boolean')
      this.current._column_visibilities[col] = bool;

    return this.current._column_visibilities[col];
  }

  zoomIn() {
    throw new errors.NotImplementedError();
  }
  zoomOut() {
    throw new errors.NotImplementedError
  }

}

module.exports = GUI;
