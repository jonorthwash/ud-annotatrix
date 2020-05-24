'use strict';

let _g = null;
let _graph = null;

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
	console.log(_graph.config.zoom, _graph.config.pan);
	// Create main svg which serves as a container
	let zoom = d3
		.zoom()
		.scaleExtent([0.5, 5])
		.on("zoom", function () {
			_graph.config.zoom = d3.event.transform.k;
			_graph.config.pan = {x: d3.event.transform.x, y: d3.event.transform.y};
			_g.attr("transform", d3.event.transform);
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

	console.log(svg);

	/*$("#graph-svg").on("click", ".token", function() {
		console.log("asdf", $(this).attr('id'));
	});*/

	// <g> will actually house all the elements
	console.log("begin");
	console.log(_graph.config.zoom);
	console.log(_graph.config.pan);
	console.log("begin2.0");
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
	console.log(_graph.eles);
	_graph.eles.forEach((d) => {
		// Only want nodes
	  if(!d.classes.includes("form")) {
			return;
		}

		// Find sizing of the node label
		let transform = d3.zoomTransform(_g.node());
	  let textElement = _g
			.append("text")
			.attr("id", "text" + d.clump)
			.text(d.form);
	  let txt = $("#text" + d.clump)[0];
	  let rectWidth = txt.getBoundingClientRect().width / transform.k + 10;
	  let rectHeight = txt.getBoundingClientRect().height / transform.k;
		textElement.remove();

		// we use <svg> as a instead of <g> because <g> can only use transform and not x/y attr.
		// perfomance-wise, they are basically the same.
	  let nodeGroup = _g
			.append("svg") 
			.attr("id", "group" + d.clump)
			.attr("width", rectWidth)
			.attr("height", nodeHeight)
			.attr("class", "token")
			.attr("x", currentX)
			.attr("y", 100)
			.style("overflow", "visible")
			.style("cursor", "pointer");

		_graph.tokens[d.clump] = d.token;

		// Create node
	  nodeGroup
			.append("rect")
			.attr("width", rectWidth)
			.attr("height", nodeHeight)
			.attr("rx", 8)
			.attr("ry", 8)
			.attr("id", function () {
		  	return "token" + d.clump;
			})
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
			.text(d.clump+1)
			.attr("x", "50%")
			.attr("y", 45)
			.attr("text-anchor", "middle");

		// Spacing of nodes
	  currentX += spacing + rectWidth;
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
	//let heights = getHeights(deprels);

	deprels.forEach((d) => {
		console.log(d);
		/*let height = heights[d];
		let mid = calculateMid(d, height);
		let pathGroup = _g
			.append("g")
			.attr("id", "group" + id)
			.attr("class", "deprel");

		pathGroup
			.append("path")
			.style("stroke", "#BEBEBE")
			.style("stroke-width", "6px")
			.style("fill", "none")
			.attr("marker-end", "url(#end)")
			.attr("d", leftCurve(d, rectWidth, height) + " " + rightCurve(d, rectWidth, height))
			.attr("class", "deprel" + id);

		pathGroup
			.append("text")
			.attr("id", "text" + id)
			.text(text)
			.attr("x", dir < 0 ? 8 : 5) // left margin of embedded text
			.attr("y", rectHeight / 2 + 4)
			.style("cursor", "pointer")
			.attr(
				"transform",
				"translate(" +
					(mid[0] - rectWidth / 2) +
					"," +
					(mid[1] - rectHeight / 2) +
					")"
			);*/
		});
}

function leftCurve(d, rectWidth, h) {
  let xpos1 =
    parseInt(d.source.attr("x")) + parseInt(d.source.attr("width")) / 2;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 =
    parseInt(d.target.attr("x")) + parseInt(d.target.attr("width")) / 2;
  let dir = calculateDirection(d);
  let initialOffset = xpos1 - dir * 20;
  let height = 65 * h;
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
  return (
    "M " + initialOffset + "," + ypos1 +
    " L " + c1x + "," + c1y +
    " C " + c2x + "," + c2y + " " + c3x + "," + c3y + " " + c4x + "," + c4y +
    " L " + c4x + "," + c4y + " " + rectLeft + "," + c4y
  );
}

function rightCurve(d, rectWidth, h) {
  let xpos1 =
    parseInt(d.source.attr("x")) + parseInt(d.source.attr("width")) / 2;
  let ypos1 = parseInt(d.source.attr("y"));
  let xpos2 =
    parseInt(d.target.attr("x")) + parseInt(d.target.attr("width")) / 2;
  let ypos2 = parseInt(d.target.attr("y"));
  let dir = calculateDirection(d);
  let initialOffset = xpos1 - dir * 20;
  let height = 65 * h;
  let rectRight = (initialOffset + xpos2) / 2 - (dir * rectWidth) / 2;
  let slant = 0.15;
  let hor = h * 100;
  let d1x = xpos2 + (dir * hor * slant) / 2;
  let d2x = xpos2 + dir * hor * slant;
  let d3x = d2x + dir * hor * slant * 0.7;
  let d4x = d3x + dir * hor * slant * 0.7;
  let d1y = ypos1 - height / 2;
  let d2y = ypos1 - height;
  let d3y = d2y;
  let d4y = d2y;
  return (
    "M " +
    rectRight +
    "," +
    (ypos2 - height) +
    " L " +
    d4x +
    "," +
    d4y +
    " C" +
    d3x +
    "," +
    d3y +
    " " +
    d2x +
    "," +
    d2y +
    " " +
    d1x +
    "," +
    d1y +
    " L" +
    xpos2 +
    "," +
    (ypos2 - 8)
  );
}

function getHeights(deprels) {
  function dist(a) {
    return Math.abs(a.source - a.target);
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
  console.log(deprels);
  let heights = [];
  let finalHeights = new Map();
  for (let i = 0; i < graph.nodes.length + 1; i++) {
    heights.push(0);
  }
  for (let i = 0; i < graph.links.length; i++) {
    let a = graph.links[i];
    let dir = Math.sign(a.target - a.source);
    let h = 0;
    for (let j = a.source + dir; j != a.target; j += dir) {
      // todo: instead of just getting the maximum
      // if there is a lower height that is not taken
      // then take that height. this way we don't get super
      // tall heights for no reason.
      h = Math.max(h, heights[j]);
    }
    h++;
    finalHeights.set(a, h);
    console.log(a, h);
    for (let j = a.source; ; j += dir) {
      heights[j] = h;
      if (j == a.target) {
        break;
      }
    }
    console.log(heights);
  }
  console.log("FH: ", finalHeights);
  return finalHeights;
}

module.exports = {bind, run};