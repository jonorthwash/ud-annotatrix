'use strict';

const _ = require('underscore');
const $ = require('jquery');
const C2S = require('canvas2svg');
const funcs = require('./funcs');

function latex(app) {

  if (!app.graph.length)
    return;

  let tokensLine = '',
  posLine = '',
  deprelLines = [];

  app.graph.eles.forEach(node => {
    if (node.data.name === 'form') {
      if (node.data.token.upostag === undefined)
        return 'error';

      tokensLine += ` \\& ${node.data.label}`;
      posLine += `\\&{\\tt ${node.data.token.upostag}}`;
    }

    if (node.data.name === 'dependency') {
      if (node.data.label === undefined)
        return 'error';

      const source = node.data.sourceToken.indices.cytoscape,
        target = node.data.targetToken.indices.cytoscape,
        label = node.data.deprel || '_';

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

  funcs.download(`${app.corpus.filename}.tex`, 'application/x-latex', latex);

  return latex;
}

function png(app) {

  if (!app.graph.length)
    return;

  const link = $('<a>')
    .attr('download', `${app.corpus.filename}.png`)
    .attr('href', app.graph.cy.png());
  $('body').append(link);
  link[0].click();

  return;
}

function svg(app) {

  if (!app.graph.cy)
    return;

  const ctx = new C2S(app.graph.cy.width(), app.graph.cy.height());
  app.graph.cy.renderer().renderTo(ctx); // DEBUG: this doesn't work

  funcs.download(`${app.corpus.filename}.svg`, 'image/svg+xml', ctx.getSerializedSvg());
}

module.exports = {
  latex,
  png,
  svg
};
