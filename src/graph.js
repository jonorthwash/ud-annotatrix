'use strict';

const $ = require('jquery');
const _ = require('underscore');

const cfg = require('./config');
const cytoscape = require('./cytoscape/cytoscape');
const funcs = require('./funcs');
const CY_STYLE = require('./cy-style');
const sort = require('./sort');

class Graph {
  constructor(mgr, options) {

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

  eles() {
    return _.map(manager.current.eles, ele => {
      if (ele.data.name === 'dependency') {

        const src = ele.data.sourceAnalysis,
          tar = ele.data.targetAnalysis;

        ele.data.label = gui.is_ltr
          ? tar.num < src.num
            ? `${src.deprel}⊳`
            : `⊲${src.deprel}`
          : tar.num < src.num
            ? `⊲${src.deprel}`
            : `${src.deprel}⊳`;

        ele.data.ctrl = new Array(4).fill(getEdgeHeight(src.num, tar.num));
        ele.classes = 'dependency';
      }

      return ele;
    });
  }

  update() {
    if (gui.graph_disabled)
      return;

    this.options.layout = {
      name: 'tree',
      padding: 0,
      nodeDimensionsIncludeLabels: false,
      cols: (gui.is_vertical ? 2 : undefined),
      rows: (gui.is_vertical ? undefined : 2),
      sort: (gui.is_vertical
        ? sort.vertical
        : gui.is_ltr
          ? sort.ltr
          : sort.simple)
    };
    this.options.elements = this.eles();

    window.cy = cytoscape(this.options)
      .minZoom(0.1)
      .maxZoom(10.0)
      .fit()
      .zoom(null) // TODO: gui.zoom
      .center()
      .pan(null); // TODO: gui.pan

    // this.bind()
  }

  clear() {

  }

  removeDependency(ele) {

  }
}

function getEdgeHeight(srcNum, tarNum) {

  let edgeHeight = cfg.defaultEdgeHeight * (tarNum - srcNum);
  if (gui.is_ltr)
      edgeHeight *= -1;
  if (Math.abs(edgeHeight) !== 1)
      edgeHeight *= cfg.defaultEdgeCoeff;
  if (gui.is_vertical)
      edgeHeight = 45;

  log.debug(`getEdgeHeight(): ${edgeHeight}`);

  return edgeHeight;
}

module.exports = Graph;
