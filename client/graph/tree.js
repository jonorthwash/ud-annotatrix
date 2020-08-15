"use strict";

const utils = require("./utils.js");

let _graph = null;
let _g = null;
let zoom = null;
let svg = null;

const spacing = 50;

function bind(graph) {
  _graph = graph;
}

function run() {
  d3.select("#graph-svg").remove();

  zoom = d3
  .zoom()
  .scaleExtent([0.1, 5])
  .on("zoom", function () {
    _g.attr("transform", d3.event.transform);
  })
  .on("end", function() {
    // Save settings to config.
    _graph.config.zoom = d3.event.transform.k;
    _graph.config.pan = {x: d3.event.transform.x, y: d3.event.transform.y};
  });

  // Create main svg which serves as a container
  svg = d3
    .select("#graph-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("id", "graph-svg")
    .style("background", "white")
    .style("font-family", "Arial")
    .style("font-size", "20px")
    .call(zoom)
    .on("dblclick.zoom", null);

  // <g> will actually house all the elements
  _g = svg
    .append("g")
    .attr("id", "graph-g")
    .attr("transform", "translate(" + _graph.config.pan.x + "," + _graph.config.pan.y + ") scale(" + _graph.config.zoom + ")");

  // Align the current zoom to the saved zoom
  svg.call(zoom.transform, d3.zoomIdentity.translate(_graph.config.pan.x, _graph.config.pan.y).scale(_graph.config.zoom));

  drawNodes();
  drawDeprels();

  // Lower the pos-edge below the token and the pos label
  d3.selectAll(".pos-edge").lower();
}

function drawNodes() {
  let el = _graph.app.corpus.is_ltr ? _graph.eles : _graph.eles.reverse();
  // Heights of the nodes on the tree. 0 represents the top.
  let heights = [];
  
  // Saves whether a token is a "root" or not.
  // We loosely define "root" as not having a deprel
  // point to it.
  let isRoot = [];

  // Spacing between each tree level
  let heightSpacing = 200;

  for(let i = 0; i < _graph.numTokens; i++) {
    heights.push(0);
    isRoot.push(true);
  }

  _graph.eles.forEach((d) => {
    if(!d.classes.includes("dependency")) {
      return;
    }
    isRoot[d.targetNum] = false;
  });

  console.log(_graph.connections);
  for(let i = 0; i < isRoot.length; i++) {
    if(isRoot[i]) {
      traverseTree(i, heights);
    }
  }
  for(let i = 0; i < heights.length; i++) {
    heights[i] = heightSpacing * heights[i];
  }
  console.log(heights);
  utils.drawNodes(_g, el, heights, spacing);
}

/**
 * BFS to set the heights of the tree, starting from a root token
 * @param {Integer} token current token
 * @param {Array} heights holds the heights of the tokens
 */
function traverseTree(token, heights) {
  let queue = [];
  queue.push([token, heights[token]]);
  while (queue.length > 0) {
    let top = queue.shift();
    heights[top[0]] = top[1];
    if(top[0] in _graph.connections) {
      _graph.connections[top[0]].forEach(f => {
        queue.push([f, top[1] + 1]);
      });
    }
  }
}

function drawDeprels() {
  // Ending arrowheads
  let markerDef = _g.append("defs");
  markerDef
    .append("marker")
    .attr("id", "end")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", "2")
    .attr("refY", "2")
    .attr("markerWidth", "10")
    .attr("markerHeight", "10")
    .attr("orient", "auto")
    .style("fill", "#111")
    .append("path")
    .attr("d", "M 1 1 L 3 2 L 1 3 Z");

  markerDef
    .append("marker")
    .attr("id", "start")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", "2")
    .attr("refY", "2")
    .attr("markerWidth", "10")
    .attr("markerHeight", "10")
    .attr("orient", "auto")
    .style("fill", "#111")
    .append("path")
    .attr("d", "M 3 1 L 1 2 L 3 3 Z");
    

  _graph.eles.forEach((d) => {
    if(!d.classes.includes("dependency")) {
      return;
    }
    // Bottom of source to top of target
    let xpos1 = parseInt($("#"+d.source).attr("x")) + parseInt($("#"+d.source).attr("width")) / 2;
    let ypos1 = parseInt($("#"+d.source).attr("y")) + parseInt($("#"+d.source).attr("height"));
    let xpos2 = parseInt($("#"+d.target).attr("x")) + parseInt($("#"+d.target).attr("width")) / 2;
    let ypos2 = parseInt($("#"+d.target).attr("y"));
    let dir = Math.sign(xpos1 - xpos2); 
    let line = _g
                .append("line")
                .attr("class", d.classes)
                .attr("attr", d.attr)
                .style("stroke-width", "4px")
                .attr("id", d.id)
                .attr("num", d.num);
    // We need to do this to orient the text correctly.
    if(dir == -1) {
      line
        .attr("x1", xpos1)
        .attr("y1", ypos1)
        .attr("x2", xpos2)
        .attr("y2", ypos2)
        .attr("marker-end", "url(#end)");
    } else {
      line
        .attr("x1", xpos2)
        .attr("y1", ypos2)
        .attr("x2", xpos1)
        .attr("y2", ypos1)
        .attr("marker-start", "url(#start)")
    }

    _g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -4)
      .attr("id", "textContainer-" + d.id)
      .append("textPath")
      .attr("href", "#" + d.id)
      .attr("startOffset", dir == -1 ? "60%" : "40%")
      .text(d.label)
      .attr("class", "deprel-label")
      .style("cursor", "pointer")
      .attr("id", "text-" + d.id);
  });
}

function zoomIn() {
  svg.call(zoom.scaleBy, 1.25);
  saveZoom();
}

function zoomOut() {
  svg.call(zoom.scaleBy, 0.8);
  saveZoom();
}

function resetZoom() {
  var bounds = d3.select("#graph-g").node().getBBox();
  let w = d3.select("#graph-svg").node().clientWidth;
  let h = d3.select("#graph-svg").node().clientHeight;
  var width = bounds.width,
      height = bounds.height;
  var midX = bounds.x + width / 2,
      midY = bounds.y + height / 2;
  if (width == 0 || height == 0) return; // nothing to fit
  var scale = (0.95) / Math.max(width / w, height / h);
  var translateX = w / 2 - scale * midX;
  var translateY = h / 2 - scale * midY;

  svg.call(
    zoom.transform,
    d3.zoomIdentity.translate(translateX, translateY).scale(scale)
  );
  saveZoom();
}

function zoomTo(s) {
  svg.call(zoom.transform, d3.zoomIdentity.translate(_graph.config.pan.x, _graph.config.pan.y).scale(s));
  saveZoom();
}

function saveZoom() {
  let transform = d3.zoomTransform(_g.node());
  _graph.config.zoom = transform.k;
  _graph.config.pan = {x: transform.x, y: transform.y};
  svg.call(zoom.transform, d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k))
}

/**
 * Draw mouse on the svg.
 * @param {MouseObject} mouse 
 */
function drawMouse(mouse) {
  const id = mouse.id.replace(/[#:]/g, "_");
  if (!$(`#${id}.mouse`).length) {
    _g.append("rect")
      .attr("id", id)
      .attr("class", "mouse")
      .attr("width", 5)
      .attr("height", 5);
  }
  if(mouse.position) {
    d3.select(`#${id}.mouse`)
      .attr("x", mouse.position.x)
      .attr("y", mouse.position.y)
      .style("fill", "#" + mouse.color);
  }
  
}

function displayError() {
  let t = d3.transition()
    .delay(750)
    .duration(500)
    .ease(d3.easeLinear);
  d3
    .select("#graph-container")
    .append("div")
    .text("Warning: Graph contains a cycle or needs a root. Unable to show vertical view.")
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "0")
    .style("right", "0")
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("text-shadow", "1px 1px 2px black")
    .style("color", "red")
    .style("font-size", "20px")
    .transition(t).style("opacity", "0").remove();
}

module.exports = {bind, run, zoomIn, zoomOut, resetZoom, zoomTo, drawMouse, displayError};