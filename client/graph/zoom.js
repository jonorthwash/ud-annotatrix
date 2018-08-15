'use strict';

var _graph = null;

/**
 * Bind the cytoscape graph to the internal reference.
 *
 * @param {Graph} graph
 */
function bind(graph) {
  _graph = graph;
}

/**
 * Zoom in and save changes.
 */
function _in() {

  if (!_graph)
    return;

  let zoom = _graph.config.zoom || _graph.cy.zoom();
  zoom *= 1.1;

  _graph.cy.zoom(zoom);
  _graph.save();
}

/**
 * Zoom out and save changes.
 */
function out() {

  if (!_graph)
    return;

  let zoom = _graph.config.zoom || _graph.cy.zoom();
  zoom /= 1.1;

  _graph.cy.zoom(zoom);
  _graph.save();
}

/**
 * Zoom to a particular value and save changes.
 *
 * @param {Number} zoom
 */
function to(zoom) {

  if (!_graph)
    return;

  _graph.cy.zoom(zoom);
  _graph.save();
}

/**
 * Wrapper around the cytoscape zoom-fit function (and save).
 */
function fit() {

  if (!_graph)
    return;

  _graph.cy.fit().center();
  _graph.save();
}

/**
 * Check if we have any zoom/pan saved in the config.  If not, use a default one.
 *
 * @param {Graph} graph
 */
function checkFirst(graph) {
  if (!graph.config.drawn_sentence) {

    graph.cy.fit().center();
    graph.config.zoom = graph.cy.zoom();
    graph.config.pan = graph.cy.pan();
    graph.config.drawn_sentence = true;

  }
}

module.exports = {
  bind,
  'in': _in, // 'in' is a reserved keyword
  out,
  to,
  fit,
  checkFirst
};
