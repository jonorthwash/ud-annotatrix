'use strict';

const $ = require('jquery');
const _ = require('underscore');

const funcs = require('./funcs');
const CY_STYLE = require('./cy-style.js');

class Graph {
  constructor(mgr, options) {
    this.mgr = mgr;
    this.options = _.defaults(options, {
      container: funcs.inBrowser() ? $('#cy') : null,
      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,
      zoomingEnabled: true,
      userZoomingEnabled: false,
      wheelSensitivity: 0.1,
      style: CY_STYLE,
      layout: null,
      elements: []
    });


  }

  update() {
    
  }
}

module.exports = Graph;
