export const nodeHeight = 30; // Height of nodes
export const lineLen = 10; // Length of line between form and pos 

function rightRoundedRect(x, y, width, height, radius) {
  return "M" + x + "," + y
       + "h" + (width - radius)
       + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
       + "v" + (height - 2 * radius)
        + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
       + "h" + (radius - width)
       + "z";
}

function leftRoundedRect(x, y, width, height, radius) {
  return "M" + (x+width) + "," + y
       + "h" + (-width + radius)
       + "a" + radius + "," + radius + " 1 0 0 " + -radius + "," + radius
       + "v" + (height - 2 * radius)
       + "a" + radius + "," + radius + " 1 0 0 " + radius + "," + radius
       + "h" + (width - radius)
       + "z";
}

/**
 * Draws the nodes on the svg.
 * @param {g} _g <g> element to draw on
 * @param {Array} el array of nodes
 * @param {Array} heights heights of each node
 * @param {Integer} spacing how far nodes are apart
 * @returns token number of root
 */
export function drawNodes(_g, el, heights, spacing) {
  let currentX = 200;
  let rootToken = null;
  el.forEach(d => {
    // Only want nodes
    if(!d.classes.includes("form")) {
      return;
    }
    if(d.classes.includes("root")) {
      rootToken = d.subId;
    }
    // Classes for form label
    let textClass = d.classes.replace('form', '');

    // Find sizing of the node label
    let textElement = _g
      .append("text")
      .text(d.form)
      .attr("class", 'form-label' + textClass);

    let rectWidth = Math.max(20, textElement.node().getComputedTextLength() + 10);
    textElement.remove();

    // Find sizing of token number
    textElement = _g
      .append("text")
      .text(d.conlluId)
      .attr("class", 'tokenNum-label' + textClass);

    let tokenNumWidth = textElement.node().getComputedTextLength() + 10;
    textElement.remove();

    let width = rectWidth + tokenNumWidth;
    let height = 2 * nodeHeight + lineLen;
    // tokenGroup houses everything related to the current form

    let tokenGroup = _g
      .append("svg") 
      .attr("id", "token-" + d.subId)
      .attr("width", width)
      .attr("height", height)
      .attr("y", heights[d.subId])
      .style("overflow", "visible")
      .style("cursor", "pointer");

    // nodeGroup houses the form
    let nodeGroup = tokenGroup
      .append("svg")
      .attr("width", rectWidth)
      .attr("height", nodeHeight)
      .attr("id", "group-" + d.subId)
      .attr("class", "token")
      .attr("subId", d.subId)
      .style("overflow", "visible");

    // Create node
    nodeGroup
      .append("path")
      .attr("d", leftRoundedRect(0, 0, rectWidth, nodeHeight, 5))
      .attr("id", d.id)
      .attr("attr", d.attr)
      .attr("subId", d.subId)
      .attr("class", d.classes)
      .attr("num", d.num);

    // Add text
    nodeGroup
      .append("text")
      .text(d.form)
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("id", "text-" + d.id)
      .attr("class", 'form-label' + textClass);
    
    let tokenNumGroup = tokenGroup
      .append("svg")
      .attr("x", rectWidth)
      .attr("width", tokenNumWidth)
      .attr("height", nodeHeight)
      .style("overflow", "visible");

    tokenNumGroup
      .append("path")
      .attr("d", rightRoundedRect(0, 0, tokenNumWidth, nodeHeight, 5))
      .attr("class", "tokenNum" + textClass);

    // Add token number
    tokenNumGroup
      .append("text")
      .text(d.conlluId)
      .attr("class", "tokenNum-label" + textClass)
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central");

    nodeGroup.raise();

    // Calculate sizing of pos label
    let posTextElement = _g
      .append("text")
      .text(d.posLabel);

    let posWidth = Math.max(40, posTextElement.node().getComputedTextLength() + 10);
    posTextElement.remove();

    // posGroup houses the pos elements
    let posGroup = tokenGroup
      .append("svg")
      .attr("x", width/2-posWidth/2)
      .attr("y", nodeHeight + lineLen)
      .attr("width", posWidth)
      .attr("height", nodeHeight)
      .style("overflow", "visible");

    // Add pos form
    posGroup
      .append("rect")
      .attr("width", posWidth)
      .attr("height", nodeHeight)
      .attr("id", "pos-" + d.subId)
      .attr("class", d.posClasses)
      .attr("attr", d.posAttr)
      .attr("subId", d.subId)
      .attr("rx", 5)
      .attr("ry", 5);

    // Add pos text
    posGroup
      .append("text")
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("class", "pos-label")
      .attr("id", "text-pos-" + d.subId)
      .text(d.posLabel)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central");

    // Add line connect form to pos
    tokenGroup
      .append("line")
      .attr("x1", width/2)
      .attr("y1", nodeHeight)
      .attr("x2", width/2)
      .attr("y2", nodeHeight + lineLen)
      .attr("class", "pos-edge")
      .style("stroke", "#484848")
      .style("stroke-width", 3);

    // Spacing of nodes
    // We need to shift the current node if pos node is too long
    currentX += (posWidth > width ? ((posWidth - width) / 2) : 0)
    tokenGroup.attr("x", currentX);
    currentX += spacing + (posWidth > width ? ((width + posWidth) / 2) : width);
  });
  return rootToken;
}
