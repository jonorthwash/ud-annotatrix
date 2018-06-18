'use strict';

const $ = require('jquery');

const funcs = require('./funcs');

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
  }

  update() {
    if (!funcs.inBrowser())
      return;

    // textarea
    $('#text-data').val(this.mgr.sentence);

    // navigation buttons
    $('#current-sentence').val(this.mgr.index + 1);
    $('#btnPrevSentence').attr('disabled', !!this.mgr.index);
    $('#btnNextSentence').attr('disabled', (this.mgr.index === this.mgr.length));
  }

  zoomIn() {
    //
    return this;
  }
  zoomOut() {
    //
    return this;
  }

}

module.exports = GUI;
