'use strict';

const _ = require('underscore');
const $ = require('jquery');
const C2S = require('canvas2svg');

function download(filename, mimetype, uriComponent) {
  if (!gui.inBrowser)
    return false;

  const link = $('<a>')
    .attr('download', filename)
    .attr('href', `data:${mimetype};charset=utf-8,${encodeURIComponent(uriComponent)}`);
  $('body').append(link);
  link[0].click();
  return true;
}

function latex() {

  let tokensLine = '',
    posLine = '',
    deprelLines = [];

  _.each(graph.eles(), node => {
    if (node.data.name === 'form') {
      if (node.data.analysis.upostag === undefined)
        return 'error';

      tokensLine += ` \\& ${node.data.label}`;
      posLine += `\\&{\\tt ${node.data.analysis.upostag}}`;
    }

    if (node.data.name === 'dependency') {
      if (node.data.label === undefined)
        return 'error';

      const source = node.data.sourceAnalysis.id,
        target = node.data.targetAnalysis.id,
        label = node.data.sourceAnalysis.deprel;

      deprelLines.push(`\depedge{${source}}{${target}}{${label}}`);
    }
  });

  tokensLine = `${tokensLine.replace('\\&', '')} \\\\`;
  posLine = `${posLine.replace('\\&', '')} \\\\`;

  // now make the LaTeX from it
  const latex = [
    '\\begin{dependency}',
    '  \\begin{deptext}[column sep=0.4cm]',
    `    ${tokensLine}`,
    `    ${posLine}`,
    `  \\end{deptext}` ].concat(deprelLines.map((line) => {
        return `  \\${line}`;
    }), '\\end{dependency} \\\\').join('\n');

  download(`${manager.filename}.tex`, 'application/x-latex', latex);

  return latex;
}

function png() {

  const link = $('<a>')
    .attr('download', `${manager.filename}.png`)
    .attr('href', cy.png());
  $('body').append(link);
  link[0].click();

  return;
}

function svg() {
  const ctx = new C2S(cy.width(), cy.height());
  cy.renderer().renderTo(ctx); // DEBUG: this doesn't work

  download(`${manager.filename}.svg`, 'image/svg+xml', ctx.getSerializedSvg());
}

module.exports = {
  latex,
  png,
  svg
};
