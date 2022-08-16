import * as _ from "underscore";
import * as $ from "jquery";
import * as d3 from "d3";

import {download} from "./funcs";
import type {App} from "../app";

/**
 * Export an application instance to LaTeX format.  The client will be prompted
 *  to download the file.
 */
export function latex(app: App): string|null {

  if (!app.graph.length)
    return null;

  let tokensLine = "";
  let posLine = "";
  const deprelLines: string[] = [];

  app.graph.eles.forEach(node => {
    if (node.name === "form") {
      if (node.token.upostag === undefined)
        return "error"; // TODO: This has no effect..?

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

    return null;
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

  download(`${app.corpus.filename}.tex`, "application/x-latex", latex);

  return latex;
}

/**
 * Export an application instance to PNG format.  The client will be prompted to
 *  download the file.
 */
export function png(app: App) {

  if (!app.graph.length)
    return;

  let imgsrc = getSVG();

  let w = (d3.select("#graph-svg").node() as any).clientWidth as number;
  let h = (d3.select("#graph-svg").node() as any).clientHeight as number;
  
  let image = new Image(w, h);

  image.onload = function() {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    context.drawImage(image, 0, 0, w, h);
    let href = canvas.toDataURL();
    console.log(href);
    const link = $("<a>").attr("download", `${app.corpus.filename}.png`).attr("href", href);
    $("body").append(link);
    link[0].click();
  }

  image.src = imgsrc;
  console.log("end");
}

/**
 * Export an application instance to SVG format.  The client will be prompted to
 *  download the file.
 */
export function svg(app: App) {
  if (!app.graph.length)
    return;
  let href = getSVG();
  const link = $("<a>").attr("download", `${app.corpus.filename}.svg`).attr("href", href);
  $("body").append(link);
  link[0].click();
}

/**
 * 
 */
function getSVG() {
  // Basically just insert the CSS inline so that
  // this info isn't lost when it gets exported.
  [
    {el: '.form', properties: ['fill', 'stroke', 'stroke-width']},
    {el: '.form.root', properties: ['stroke-width']},
    {el: '.form.activated', properties: ['fill']},
    {el: '.form.arc-source', properties: ['stroke']},
    {el: '.form.arc-target', properties: ['stroke']},
    {el: '.form.neighbor', properties: ['fill']},
    {el: '.dependency', properties: ['stroke', 'opacity']},
    {el: '.dependency.selected.moving', properties: ['stroke']},
    {el: '.dependency.incomplete', properties: ['stroke']},
    {el: '.dependency.error', properties: ['stroke']},
    {el: '.dependency.selected', properties: ['stroke']},
    {el: '.dependency.dotted', properties: ['stroke-dasharray']},
    {el: '.deprel-label', properties: ['text-shadow']},
    {el: '.form-label.root', properties: ['font-weight']},
    {el: '.pos', properties: ['fill', 'stroke', 'stroke-width']},
    {el: '.pos.error', properties: ['stroke']},
    {el: '.multiword', properties: ['fill', 'stroke', 'stroke-width']},
    {el: '.multiword.multiword-active', properties: ['fill']},
    {el: '.multiword-label', properties: ['fill', 'stroke', 'stroke-width']},
    {el: ".tokenNum", properties: ['fill', 'stroke', 'stroke-width']},
    {el: ".tokenNum.root", properties: ['stroke-width']},
    {el: ".tokenNum-label.root", properties: ['font-weight']},
  ].forEach(row => {
    d3.selectAll(row.el).each(function() {
      const element = this as HTMLElement;
      row.properties.forEach(function(prop) {
        const computedStyle = getComputedStyle(element, null),
        value = computedStyle.getPropertyValue(prop);
        (element.style as any)[prop] = value;
      });
    });
  });

  let w = (d3.select("#graph-svg").node() as any).clientWidth as number;
  let h = (d3.select("#graph-svg").node() as any).clientHeight as number;
  // Firefox has a bug that require the root svg node to have
  // an explicit width and height in order to be drawn onto a canvas.
  d3.select("#graph-svg").attr("width", w);
  d3.select("#graph-svg").attr("height", h);
  var s = new XMLSerializer().serializeToString(d3.select("#graph-svg").node() as Node)
  var encodedData = window.btoa(unescape(encodeURIComponent(s)));
  var base64Data = 'data:image/svg+xml;base64,' + encodedData;
  console.log(base64Data);
  d3.select("#graph-svg").attr("width", "100%");
  d3.select("#graph-svg").attr("height", "100%");
  return base64Data;
}
