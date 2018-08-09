'use strict';

var _graph = null;

function bind(graph) {
  _graph = graph;
}

function _in() {

  if (!_graph)
    return;

  let zoom = _graph.config.zoom || _graph.cy.zoom();
  zoom *= 1.1;

  _graph.cy.zoom(zoom);
  _graph.save();
}

function out() {

  if (!_graph)
    return;

  let zoom = _graph.config.zoom || _graph.cy.zoom();
  zoom /= 1.1;

  _graph.cy.zoom(zoom);
  _graph.save();
}

function to(zoom) {

  if (!_graph)
    return;

  _graph.cy.zoom(zoom);
  _graph.save();
}

function fit() {

  if (!_graph)
    return;

  _graph.cy.fit().center();
  _graph.save();
}

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
