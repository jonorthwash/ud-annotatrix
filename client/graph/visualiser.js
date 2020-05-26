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
			// Save settings to config.
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
	let el = _graph.app.corpus.is_ltr ? _graph.eles : _graph.eles.reverse();
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
		//let rectWidth = txt.getBoundingClientRect().width / transform.k;
		let rectWidth = Math.max(40, textElement.node().getComputedTextLength() + 10);
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
/**
 * Draws deprels.
 */
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

	function shiftTokens(shift, target) {
		while ($("#group-" + target).length) {
			let curX = d3.select("#group-" + target).attr("x");
			d3.select("#group-" + target).attr("x", parseInt(curX) + shift);
			target++;
		}
	} 

	function needShift(d, rectWidth, height) {
		let xpos1 = parseInt($("#"+d.source).attr("x")) + parseInt($("#"+d.source).attr("width")) / 2;
		let xpos2 = parseInt($("#"+d.target).attr("x")) + parseInt($("#"+d.target).attr("width")) / 2;
		let slant = 0.15;
		let hor = Math.min(tokenDist(d.id), height) * 100;
		
		let dir = Math.sign(xpos1 - xpos2);
		let initialOffset = xpos1 - dir * 20;
		let rectLeft = (initialOffset + xpos2) / 2 + (dir * rectWidth) / 2;
		let c2x = initialOffset - dir * hor * slant;
		let c3x = c2x - dir * hor * slant * 0.7;
		let c4x = c3x - dir * hor * slant * 0.7;
		let spacing = 20;
		if (dir == -1) {
			if (rectLeft < c4x) {
				return c4x - rectLeft + spacing;
			}
		} else {
			if (rectLeft > c4x) {
				return rectLeft - c4x + spacing;
			}
		}
		return 0;
}

	// We first need to deal with the necessary shifting of tokens
	// in order for the labels to fit nicely in the deprels before
	// actually drawing the deprels.
	deprels.forEach((d) => {
		// Calculate dimensions of text
		let textElement = _g
			.append("text")
			.attr("id", "text-" + d.id)
			.text(d.label);
		let rectWidth = textElement.node().getComputedTextLength() + 10;
		textElement.remove();
		let shift = needShift(d, rectWidth, heights.get(d.id));
		if(shift != 0) {
			shiftTokens(shift, d.targetNum);
		}
	});

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

		// Add deprel
		_g
			.append("path")
			.attr("class", "deprel")
			.style("stroke", "#BEBEBE")
			.style("stroke-width", "6px")
			.style("fill", "none")
			.attr("marker-end", "url(#end)")
			.attr("d", curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height, d.id))
			.attr("id", d.id);

		// Add deprel label
		_g
			.append("text")
			.attr("id", "text-" + d.id)
			.text(d.label)
			.attr("x", 10) // left margin of embedded text
			.attr("y", rectHeight / 2 + 4)
			.attr("class", "deprel-label")
			.style("cursor", "pointer")
			.attr(
				"transform",
				"translate(" +
					(mid - rectWidth / 2) +
					"," +
					((ypos1 - height) - rectHeight / 2) +
					")"
			)
			.attr("text-anchor", "middle");
		});

		// We want the text to be on top of everything else
		d3.selectAll(".deprel-label").raise();

		//Lower supertokens
}

/**
 * Returns the token distance for a deprel.
 * @param {String} id dep_[num1]_[num2]
 */
function tokenDist(id) {
	let sourceNum = parseInt(id.split('_')[1]);
	let targetNum = parseInt(id.split('_')[2]);
	return Math.abs(sourceNum - targetNum);
}

/**
 * Generates curve for deprel.
 * The curve starts at initialOffset (M) and consists of a
 * straight line (L) that goes into a cubic curve (C) which
 * then goes into a straight line (L) to rectLeft. Then we
 * leave a gap for the label and start the other half at
 * rectRight (M) and the same idea follows again.
 * Here, • denotes a control point used.
 *         •   •   • label •   •   •
 *
 *       •                           •
 *
 *     •                                •
 * @param {int} initialOffset x-position of source (offset)
 * @param {int} ypos1 y-position of tokens
 * @param {int} xpos2 x-position of target
 * @param {int} dir -1 or 1
 * @param {int} rectWidth width of label
 * @param {int} h scaled height of deprel
 * @param {int} height actual height of the deprel
 */
function curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height, id) {
	let rectLeft = (initialOffset + xpos2) / 2 + (dir * rectWidth) / 2;
  let slant = 0.15; // Angle of ascent/descent in the beginning/end of the curve
  let hor = Math.min(tokenDist(id), h) * 100; // How far the curved part of the curve goes
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

/**
 * Calculates the heights for each deprel.
 * @param {Array} deprels Array of deprels
 */
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
    heights.push([0]);
  }
  for (let i = 0; i < deprels.length; i++) {
    let a = deprels[i];
    let dir = Math.sign(a.targetNum - a.sourceNum);
		let h = new Set();
    for (let j = a.sourceNum + dir; j != a.targetNum; j += dir) {
			for(let k = 0; k < heights[j].length; k++) {
				h.add(heights[j][k]);
			}
      
		}
		// We basically find the lowest height that doesn't conflict
		// which any other deprel.
		console.log(h);
		let ht = 1;
    while(h.has(ht)) {
			ht++;
		}
    finalHeights.set(a.id, ht);
    for (let j = a.sourceNum; ; j += dir) {
      heights[j].push(ht);
      if (j == a.targetNum) {
        break;
      }
    }
  }
  return finalHeights;
}

module.exports = {bind, run};