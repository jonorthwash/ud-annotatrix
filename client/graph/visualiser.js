'use strict';

let _g = null;
let _graph = null;
let _numNodes = 0;

/**
 * Bind the elements to the internal reference.
 * 
 * @param {Array} eles List of both nodes and edges
 */
function bind(graph) {
	_graph = graph;
}

/**
 * Main function that runs all of the
 * subfunctions needed to generate the graph.
 */
function run() {
	d3.select("#graph-svg").remove();
	// Create main svg which serves as a container
	let zoom = d3
		.zoom()
		.scaleExtent([0.5, 5])
		.on("zoom", function () {
			_g.attr("transform", d3.event.transform);
		})
		.on("end", function() {
			_graph.config.zoom = d3.event.transform.k;
			_graph.config.pan = {x: d3.event.transform.x, y: d3.event.transform.y};
		});

	let svg = d3
		.select("#graph-container")
		.append("svg")
		.attr("width", "100%")
	  .attr("height", "100%")
		.attr("id", "graph-svg")
	  .style("background", "white")
	  .style("font-family", "Arial")
	  .style("font-size", "20")
		.call(zoom)
	  .on("dblclick.zoom", null);

	// <g> will actually house all the elements
	_g = svg
		.append("g")
		.attr("id", "graph-g")
		.attr("transform", "translate(" + _graph.config.pan.x + "," + _graph.config.pan.y + ") scale(" + _graph.config.zoom + ")");

	svg.call(zoom.transform, d3.zoomIdentity.translate(_graph.config.pan.x, _graph.config.pan.y).scale(_graph.config.zoom))

	drawNodes();
	drawDeprels();
}

/**
 * Draws the nodes on the svg.
 */
function drawNodes() {
	let currentX = 200;
	let spacing = 50;
	let nodeHeight = 55;
	_numNodes = 0;
	console.log(_graph.eles);
	let el = _graph.app.corpus.is_ltr ? _graph.eles.reverse() : _graph.eles;
	el.forEach((d) => {
		// Only want nodes
	  if(!d.classes.includes("form")) {
			return;
		}

		let num = d.id.replace(/\D/g,'');

		// Find sizing of the node label
		let transform = d3.zoomTransform(_g.node());
	  let textElement = _g
			.append("text")
			.attr("id", "text" + num)
			.text(d.form);
		let txt = $("#text" + num)[0];
		console.log();
		//let rectWidth = txt.getBoundingClientRect().width / transform.k;
		let rectWidth = textElement.node().getComputedTextLength() + 10;
		console.log(rectWidth);
	  //let rectHeight = txt.getBoundingClientRect().height / transform.k;
		textElement.remove();

		// we use <svg> as a instead of <g> because <g> can only use transform and not x/y attr.
		// perfomance-wise, they are basically the same.
	  let nodeGroup = _g
			.append("svg") 
			.attr("id", "group-" + num)
			.attr("width", rectWidth)
			.attr("height", nodeHeight)
			.attr("class", "token")
			.attr("x", currentX)
			.attr("y", 100)
			.style("overflow", "visible")
			.style("cursor", "pointer");

		// Create node
	  nodeGroup
			.append("rect")
			.attr("width", rectWidth)
			.attr("height", nodeHeight)
			.attr("rx", 8)
			.attr("ry", 8)
			.attr("id", d.id)
			.style("fill", "#7FA1FF")
			.style("stroke", "black")
			.style("stroke-width", "2px");

		// Add text
	  nodeGroup
			.append("text")
			.text(d.form)
			.attr("x", "50%")
			.attr("y", 21)
			.attr("text-anchor", "middle");
		
		// Add token number
	  nodeGroup
			.append("text")
			.text(num)
			.attr("x", "50%")
			.attr("y", 45)
			.attr("text-anchor", "middle");

		// Spacing of nodes
		currentX += spacing + rectWidth;
		_numNodes++;
	});
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
		.attr("markerWidth", "15")
		.attr("markerHeight", "15")
		.attr("orient", "auto")
		.style("fill", "#494949")
		.append("path")
		.attr("d", "M 1 1 L 3 2 L 1 3 Z");

	markerDef
		.append("marker")
		.attr("id", "selectedend")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", "2")
		.attr("refY", "2")
		.attr("markerWidth", "15")
		.attr("markerHeight", "15")
		.attr("orient", "auto")
		.style("fill", "#D856FC")
		.append("path")
		.attr("d", "M 1 1 L 3 2 L 1 3 Z");

	// Create a list of deprels
	let deprels = [];
	_graph.eles.forEach((d) => {
		if(!d.classes.includes("dependency")) {
			return;
		}
		deprels.push(d);
	});

	// Get heights for the deprels
	let heights = getHeights(deprels);
	let edgeHeight = 65; // how high the height increments by at each level
	deprels.forEach((d) => {
		let h = heights.get(d.id);
		let xpos1 = parseInt($("#"+d.source).attr("x")) + parseInt($("#"+d.source).attr("width")) / 2;
  	let ypos1 = parseInt($("#"+d.source).attr("y"));
		let xpos2 = parseInt($("#"+d.target).attr("x")) + parseInt($("#"+d.target).attr("width")) / 2;
		let dir = Math.sign(xpos1 - xpos2); // -1 if deprel going right, else 1
		let initialOffset = xpos1 - dir * 20; // Deprel is offset a little when coming out of source
		let height = h * edgeHeight; // actual height of deprel
		let mid = (initialOffset + xpos2) / 2; // x-position of the middle of the deprel

		// Calculate dimensions of text
		let transform = d3.zoomTransform(_g.node());
		let textElement = _g
			.append("text")
			.attr("id", "text" + d.id)
			.text(d.label);
		let txt = $("#text" + d.id)[0];
		let rectWidth = textElement.node().getComputedTextLength() + 10;
		let rectHeight = txt.getBoundingClientRect().height / transform.k;
		textElement.remove();

		let pathGroup = _g
			.append("g")
			.attr("id", "group-" + d.id)
			.attr("class", "deprel");

		pathGroup
			.append("path")
			.style("stroke", "#BEBEBE")
			.style("stroke-width", "6px")
			.style("fill", "none")
			.attr("marker-end", "url(#end)")
			.attr("d", curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height))
			.attr("id", d.id);

		pathGroup
			.append("text")
			.attr("id", "text" + d.id)
			.text(d.label)
			.attr("x", dir < 0 ? 8 : 5) // left margin of embedded text
			.attr("y", rectHeight / 2 + 4)
			.style("cursor", "pointer")
			.attr(
				"transform",
				"translate(" +
					(mid - rectWidth / 2) +
					"," +
					((ypos1 - height) - rectHeight / 2) +
					")"
			);
		});
}

function curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height) {
	let rectLeft = (initialOffset + xpos2) / 2 + (dir * rectWidth) / 2;
  let slant = 0.15;
  let hor = h * 100;
	let c1x = initialOffset - (dir * hor * slant) / 2;
  let c2x = initialOffset - dir * hor * slant;
  let c3x = c2x - dir * hor * slant * 0.7;
  let c4x = c3x - dir * hor * slant * 0.7;
  let c1y = ypos1 - height / 2;
  let c2y = ypos1 - height;
  let c3y = c2y;
	let c4y = c2y;
	let rectRight = (initialOffset + xpos2) / 2 - (dir * rectWidth) / 2;
	let d1x = xpos2 + (dir * hor * slant) / 2;
  let d2x = xpos2 + dir * hor * slant;
  let d3x = d2x + dir * hor * slant * 0.7;
  let d4x = d3x + dir * hor * slant * 0.7;
  let d1y = ypos1 - height / 2;
  let d2y = ypos1 - height;
  let d3y = d2y;
  let d4y = d2y;
  return (
    "M " + initialOffset + "," + ypos1 +
    " L " + c1x + "," + c1y +
    " C " + c2x + "," + c2y + " " + c3x + "," + c3y + " " + c4x + "," + c4y +
		" L " + c4x + "," + c4y + " " + rectLeft + "," + c4y +
		"M " + rectRight + "," + d2y + " L " + d4x + "," + d4y +
    " C" + d3x + "," + d3y + " " + d2x + "," + d2y + " " + d1x + "," + d1y +
    " L" + xpos2 + "," + (ypos1 - 8)
  );
}

function getHeights(deprels) {
  function dist(a) {
    return Math.abs(a.sourceNum - a.targetNum);
  }
  deprels.sort((x, y) => {
    if (dist(x) > dist(y)) {
      return 1;
    }
    if (dist(x) < dist(y)) {
      return -1;
    }
    return 0;
  });
  let heights = [];
  let finalHeights = new Map();
  for (let i = 0; i < _numNodes + 1; i++) {
    heights.push(0);
  }
  for (let i = 0; i < deprels.length; i++) {
    let a = deprels[i];
    let dir = Math.sign(a.targetNum - a.sourceNum);
    let h = 0;
    for (let j = a.sourceNum + dir; j != a.targetNum; j += dir) {
      // todo: instead of just getting the maximum
      // if there is a lower height that is not taken
      // then take that height. this way we don't get super
      // tall heights for no reason.
      h = Math.max(h, heights[j]);
    }
    h++;
    finalHeights.set(a.id, h);
    for (let j = a.sourceNum; ; j += dir) {
      heights[j] = h;
      if (j == a.targetNum) {
        break;
      }
    }
  }
  return finalHeights;
}

module.exports = {bind, run};