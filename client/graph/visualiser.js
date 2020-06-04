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
	drawSuperTokens();

	// Lower the pos-edge below the token and the pos label
	d3.selectAll(".pos-edge").lower();

	d3.selectAll(".dependency").raise();

	// We want the text to be on top of everything else
	d3.selectAll(".deprel-label").raise();

	//Lower supertokens
	d3.selectAll(".multiword").lower();
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

		let textClass = 'form-label' + d.classes.replace('form', '');

		// Find sizing of the node label
	  let textElement = _g
			.append("text")
			.text(d.form)
			.attr("class", textClass);

		let rectWidth = Math.max(40, textElement.node().getComputedTextLength() + 10);
		textElement.remove();

		// we use <svg> as a instead of <g> because <g> can only use transform and not x/y attr.
		// perfomance-wise, they are basically the same.
		let tokenGroup = _g
			.append("svg") 
			.attr("id", "token-" + d.subId)
			.attr("width", rectWidth)
			.attr("height", nodeHeight)
			//.attr("class", "token")
			.attr("y", 100)
			.style("overflow", "visible")
			.style("cursor", "pointer");

	  let nodeGroup = tokenGroup
			.append("g")
			.attr("id", "group-" + d.subId)
			.attr("class", "token")
			.attr("subId", d.subId);

		// Create node
	  nodeGroup
			.append("rect")
			.attr("width", rectWidth)
			.attr("height", nodeHeight)
			.attr("rx", 8)
			.attr("ry", 8)
			.attr("id", d.id)
			.attr("attr", d.attr)
			.attr("subId", d.subId)
			.attr("class", d.classes);

		// Add text
	  nodeGroup
			.append("text")
			.text(d.form)
			.attr("x", "50%")
			.attr("y", 21)
			.attr("text-anchor", "middle")
			.attr("id", "text-" + d.id)
			.attr("class", textClass);
		
		// Add token number
	  nodeGroup
			.append("text")
			.text(d.conlluId)
			.attr("x", "50%")
			.attr("y", 45)
			.attr("text-anchor", "middle");

		let posTextElement = _g
			.append("text")
			.text(d.posLabel);

		let posWidth = Math.max(40, posTextElement.node().getComputedTextLength() + 10);
		posTextElement.remove();

		let posGroup = tokenGroup
			.append("svg")
			.attr("x", rectWidth/2-posWidth/2)
			.attr("y", nodeHeight + 10)
			.attr("width", posWidth)
			.attr("height", 30)
			.style("overflow", "visible");

		posGroup
			.append("rect")
			.attr("width", posWidth)
			.attr("height", 30)
			.attr("id", "pos-" + d.subId)
			.attr("class", d.posClasses)
			.attr("attr", d.posAttr)
			.attr("subId", d.subId)
			.attr("rx", 5)
			.attr("ry", 5);

		posGroup
			.append("text")
			.attr("x", "50%")
			.attr("y", "50%")
			.attr("class", "pos-label")
			.attr("id", "text-pos-" + d.subId)
			.text(d.posLabel)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central");

		tokenGroup
			.append("line")
			.attr("x1", rectWidth/2)
			.attr("y1", nodeHeight)
			.attr("x2", rectWidth/2)
			.attr("y2", nodeHeight + 15)
			.attr("class", "pos-edge")
			.style("stroke", "#484848")
			.style("stroke-width", 3);

		// Spacing of nodes
		// We need to shift the current node if pos node is too long
		currentX += (posWidth > rectWidth ? ((posWidth - rectWidth) / 2) : 0)
		tokenGroup.attr("x", currentX);
		currentX += spacing + (posWidth > rectWidth ? ((rectWidth + posWidth) / 2) : rectWidth);
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
		.style("fill", "#111")
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
	let enhancedDeprels = [];
	let nonEnhDeprels = []
	_graph.eles.forEach((d) => {
		if(!d.classes.includes("dependency")) {
			return;
		}
		deprels.push(d);
		if(d.enhanced) {
			enhancedDeprels.push(d);
		}
		else {
			nonEnhDeprels.push(d);
		}
	});

	// Get heights for the deprels
	// Since enhanced deprels go below
	// we need to calculate the heights separately
	let heights1 = getHeights(nonEnhDeprels);
	let heights2 = getHeights(enhancedDeprels);
	let heights = {...heights1, ...heights2};

	let edgeHeight = 65; // how high the height increments by at each level

	function shiftTokens(shift, target, dir) {
		console.log(target);
		while ($("#token-" + target).length) {
			let curX = d3.select("#token-" + target).attr("x");
			d3.select("#token-" + target).attr("x", parseInt(curX) - dir * shift);
			target -= dir * (_graph.app.corpus.is_ltr ? 1 : -1);
		}
	} 

	function needShift(d, xpos1, xpos2, rectWidth, height) {
		let slant = 0.15;
		let hor = Math.min(tokenDist(d.id), height) * 100;
		
		let dir = Math.sign(xpos1 - xpos2);
		let initialOffset = xpos1 - dir * 15;
		let rectLeft = (initialOffset + xpos2) / 2 + (dir * rectWidth) / 2;
		let c2x = initialOffset - dir * hor * slant;
		let c3x = c2x - dir * hor * slant * 0.7;
		let c4x = c3x - dir * hor * slant * 0.7;
		let spacing = 30;
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
			.text(d.label)
			.attr('class', 'deprel-label');
		let rectWidth = textElement.node().getComputedTextLength() + 10;
		textElement.remove();

		let xpos1 = parseInt($("#"+d.source).attr("x")) + parseInt($("#"+d.source).attr("width")) / 2;
		let xpos2 = parseInt($("#"+d.target).attr("x")) + parseInt($("#"+d.target).attr("width")) / 2;
		let dir = Math.sign(xpos1 - xpos2); // -1 if deprel going right, else 1

		let shift = needShift(d, xpos1, xpos2, rectWidth, heights[d.id]);
		console.log(d, shift);
		if(shift != 0) {
				shiftTokens(shift, d.targetNum, dir);
		}
	});
	console.log("done shifting tokens");
	deprels.forEach((d) => {
		let h = heights[d.id];
		let xpos1 = parseInt($("#"+d.source).attr("x")) + parseInt($("#"+d.source).attr("width")) / 2;
  	let ypos1 = 100 + (d.enhanced ? 95 : 0)
		let xpos2 = parseInt($("#"+d.target).attr("x")) + parseInt($("#"+d.target).attr("width")) / 2;
		let dir = Math.sign(xpos1 - xpos2); // -1 if deprel going right, else 1
		let initialOffset = xpos1 - dir * 15; // Deprel is offset a little when coming out of source
		let height = (d.enhanced ? -1 : 1) * h * edgeHeight; // actual height of deprel
		let mid = (initialOffset + xpos2) / 2; // x-position of the middle of the deprel

		// Calculate dimensions of text
		//let transform = d3.zoomTransform(_g.node());
		let textElement = _g
			.append("text")
			.attr("id", "text" + d.id)
			.text(d.label)
			.attr('class', 'deprel-label');

		let rectWidth = textElement.node().getComputedTextLength() + 10;
		//let rectHeight = textElement.node().getBoundingClientRect().height / transform.k;
		textElement.remove();

		// Add deprel
		_g
			.append("path")
			.attr("class", d.classes)
			.attr("attr", d.attr)
			.style("stroke-width", "6px")
			.style("fill", "none")
			.attr("marker-end", "url(#end)")
			.attr("d", curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height, d.id, d.enhanced))
			.attr("id", d.id);

		// Add deprel label
		_g
			.append("text")
			.attr("id", "text-" + d.id)
			.text(d.label)
			.attr("class", "deprel-label")
			.style("cursor", "pointer")
			.attr(
				"transform",
				"translate(" +
					(mid) +
					"," +
					((ypos1 - height)) +
					")"
			)
			.attr("y", (d.label.replace(/[⊳⊲]/, '') == '' ? -2 : -1))
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central");
		});
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
function curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height, id, enhanced) {
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
    " L" + xpos2 + "," + (ypos1 - (enhanced ? -1 : 1) * 8)
  );
}

/**
 * Calculates the heights for each deprel.
 * @param {Array} deprels Array of deprels
 */
function getHeights(deprels) {
  function dist(a) {
		let s = a.sourceNum;
		let t = a.targetNum;
    return Math.abs(s - t);
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
  let finalHeights = {};
  for (let i = 0; i < _numNodes + 1; i++) {
    heights.push([0]);
  }
  for (let i = 0; i < deprels.length; i++) {
		let a = deprels[i];
		let s = a.sourceNum;
		let t = a.targetNum;
    let dir = Math.sign(t - s);
		let h = new Set();
    for (let j = s + dir; j != t; j += dir) {
			for(let k = 0; k < heights[j].length; k++) {
				h.add(heights[j][k]);
			}
      
		}
		// We basically find the lowest height that doesn't conflict
		// which any other deprel.
		let ht = 1;
    while(h.has(ht)) {
			ht++;
		}
    finalHeights[a.id] = ht;
    for (let j = s; ; j += dir) {
      heights[j].push(ht);
      if (j == t) {
        break;
      }
    }
  }
  return finalHeights;
}


function drawSuperTokens() {
	_graph.eles.forEach((d) => {
		if(!d.classes.includes("multiword")) {
			return;
		}
		let t1, t2;
		let format = _graph.app.corpus.format;
		// Get the indices for beginning of the multiword
		let index = d.token._analyses[0]._subTokens[0].indices;

		if (format == "CoNLL-U") {
			t1 = _graph.presentationId[index.conllu];
			
		}
		else if (format == "CG3") {
			t1 = _graph.presentationId[index.cg3];
		}
		else {
			t1 = _graph.presentationId[index.absolute];
		}

		t2 = t1 + d.len - 1;
		console.log(t1, t2);

		let x1, x2, width2;
		if(_graph.app.corpus.is_ltr) {
			x1 = parseInt($("#token-" + t1).attr("x")) - 20;
			x2 = parseInt($("#token-" + t2).attr("x")) + 20;
			width2 = parseInt($("#token-" + t2).attr("width"));
		}
		else {
			x1 = parseInt($("#token-" + t2).attr("x")) - 20;
			x2 = parseInt($("#token-" + t1).attr("x")) + 20;
			width2 = parseInt($("#token-" + t1).attr("width"));
		}
		console.log(x1, x2);
		let end = x2 + width2;

		let mwTextElement = _g
			.append("text")
			.text(d.label);

		let mwWidth = mwTextElement.node().getComputedTextLength() + 10;
		mwTextElement.remove();

		_g
			.append("rect")
			.attr("width", end - x1)
			.attr("height", 135)
			.attr("x", x1)
			.attr("y", 80)
			.attr("class", d.classes)
			.attr("subId", d.subId)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("cursor", "pointer");

		let mwGroup = _g
			.append("svg")
			.attr("x", (end + x1 - mwWidth) / 2)
			.attr("y", 60)
			.attr("width", mwWidth)
			.attr("height", 20)
			.style("overflow", "visible");

		mwGroup.append("rect")
			.attr("width", mwWidth)
			.attr("height", 20)
			.attr("class", "multiword-label");

		mwGroup.append("text")
			.attr("x", "50%")
			.attr("y", "50%")
			.text(d.label)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central");
	});
}
module.exports = {bind, run};