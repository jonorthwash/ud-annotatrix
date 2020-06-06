"use strict";

const _ = require("underscore");
const $ = require("jquery");
const C2S = require("canvas2svg");
const funcs = require("./funcs");

/**
 * Export an application instance to LaTeX format.  The client will be prompted
 *  to download the file.
 *
 * @param {App} app
 * @return {String}
 */
function latex(app) {

  if (!app.graph.length)
    return;

  let tokensLine = "", posLine = "", deprelLines = [];

  app.graph.eles.forEach(node => {
    if (node.name === "form") {
      if (node.token.upostag === undefined)
        return "error";

      tokensLine += ` \\& ${node.label}`;
      posLine += `\\&{\\tt ${node.token.upostag}}`;
    }

    if (node.name === "dependency") {
      if (node.label === undefined)
        return "error";

      const source = node.sourceToken.indices.cytoscape, target = node.targetToken.indices.cytoscape,
            label = node.deprel || "_";

      deprelLines.push(`\depedge{${source}}{${target}}{${label}}`);
    }
  });

  tokensLine = `${tokensLine.replace("\\&", "")} \\\\`;
  posLine = `${posLine.replace("\\&", "")} \\\\`;

  // now make the LaTeX from it
  const latex =
      [
        "\\begin{dependency}", "  \\begin{deptext}[column sep=0.4cm]", `    ${tokensLine}`, `    ${posLine}`,
        `  \\end{deptext}`
      ].concat(deprelLines.map((line) => { return `  \\${line}`; }), "\\end{dependency} \\\\")
          .join("\n");

  funcs.download(`${app.corpus.filename}.tex`, "application/x-latex", latex);

  return latex;
}

/**
 * Export an application instance to PNG format.  The client will be prompted to
 *  download the file.
 *
 * @param {App} app
 */
function png(app) {

  if (!app.graph.length)
    return;
  console.log(d3);

  let html = d3
    .select("#graph-svg")
    .attr("version", 1.1)
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .node().parentNode.innerHTML;
  console.log(html);
  let imgsrc = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(html)));
  console.log(imgsrc);
  let image = new Image();
  image.src = imgsrc;
  image.onload = function () {
    console.log(image);
    console.log(image.width, image.height);
    let w = d3.select("#graph-svg").node().clientWidth;
    let h = d3.select("#graph-svg").node().clientHeight;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    let href = canvas.toDataURL('image/png');
    console.log(href);
    const link = $("<a>").attr("download", `${app.corpus.filename}.png`).attr("href", href);
    $("body").append(link);
    //link[0].click();
  }
  
  return;
}

/**
 * Export an application instance to SVG format.  The client will be prompted to
 *  download the file.
 *
 * @param {App} app
 */
function svg(app) {

  if (!app.graph.cy)
    return;

  const ctx = new C2S(app.graph.cy.width(), app.graph.cy.height());
  app.graph.cy.renderer().renderTo(ctx); // DEBUG: this doesn't work

  funcs.download(`${app.corpus.filename}.svg`, "image/svg+xml", ctx.getSerializedSvg());
}

module.exports = {
  latex,
  png,
  svg
};
