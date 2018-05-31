'use strict';



function exportSVG() {
    log.debug(`called exportSVG()`);

    $('#exportModal').find('#exportedGraph').css('display', 'none');
    $('#exportModal').find('#errorExportLaTeX').css('display', 'none');
    $('#exportModal').find('#exportedLaTeX').css('display', 'none');

    const ctx = new C2S(cy.width, cy.height);
    cy.renderer().renderTo(ctx);

    $('#exportModal').find('#exportedSVG').attr('src', `data:image/svg+xml;charset=utf-8,${ctx.getSerializedSvg()}`);
    $('#exportModal').find('#exportedSVG').css('display', 'inline');
}

function exportPNG() {
    log.debug(`called exportPNG()`);

    $('#exportModal').find('#exportedSVG').css('display', 'none');
    $('#exportModal').find('#errorExportLaTeX').css('display', 'none');
    $('#exportModal').find('#exportedLaTeX').css('display', 'none');

    const b64key = 'base64,',
        b64 = cy.png().substring(cy.png().indexOf(b64key) + b64key.length),
        imgBlob = b64toBlob(b64, 'image/png');

    $('#exportModal').find('#exportedGraph').attr('src', URL.createObjectURL(imgBlob));
    $('#exportModal').find('#exportedGraph').css('width', '100%').css('display', 'inline');

    return URL.createObjectURL(imgBlob);
}

function b64toBlob(b64Data, contentType, sliceSize) {
    log.debug(`called b64toBloc(b64Data:${b64Data.slice(0,25)}..., contentType: ${contentType}, sliceSize: ${sliceSize})`);

    // defaults
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    const byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0, bytesChars = byteCharacters.length; offset < bytesChars; offset += sliceSize) {
        byteArrays.push( new Uint8Array(byteCharacters.slice(offset, offset + sliceSize).replace('/./g', (char, i) => {
          return slice.charCodeAt(i);
        })) );
    }

    return new Blob(byteArrays, { type:contentType });
}


function exportLaTeX() {
    log.debug(`called exportLaTeX()`);

    $('#exportModal').find('#exportedLaTeX').val('').css('display', 'none');
    $('#exportModal').find('#exportedSVG').css('display', 'none');
    $('#exportModal').find('#errorExportLaTeX').css('display', 'none');
    $('#exportModal').find('#exportedGraph').css('display', 'none');

    if (CODE_LATEX === 'error') {
        $('#exportModal').find('#errorExportLaTeX').css('display', 'inline');
    } else {
        const textareaRows = $('#exportModal').find('#exportedLaTeX').attr('rows');
        $('#exportModal').find('#exportedLaTeX')
            .val(CODE_LATEX.join('\n'))
            .attr('rows', Math.max(textareaRows, CODE_LATEX.length + 2) )
            .css('display', 'inline');
    }
}

function generateLaTeX(graph) {
    log.debug(`called generateLaTeX(${JSON.stringify(graph)})`);

    let tokensLine = '',
        posLine = '',
        deprelLines = [];

    $.each(graph, (i, node) => {
        if (node.classes.indexOf('wf') > -1) {
            if (node.data.upostag === undefined)
                return 'error';

            tokensLine += ` \\& ${node.data.label}`;
            posLine += `\\&{\\tt ${node.data.upostag}}`;
        }

        if (node.classes === 'dependency' || node.classes === 'dependency error') {
            if (node.data.label === undefined)
                return 'error';

            const source = parseInt(node.data.source.replace('nf', '')),
                target = parseInt(node.data.target.replace('nf', '')),
                label = (node.data.label === undefined ? '' : node.data.label.replace(/[⊳⊲]/, ''));

            deprelLines.push(`\depedge{${source}}{${target}}{${label}}`);
        }
    });

    tokensLine = `${tokensLine.replace('\\&', '')} \\\\`;
    posLine = `${posLine.replace('\\&', '')} \\\\`;

    // now make the LaTeX from it
    const LaTeX = [
        '\\begin{dependency}',
        '  \\begin{deptext}[column sep=0.4cm]',
        `    ${tokensLine}`,
        `    ${posLine}`,
        `  \\end{deptext}` ].concat(deprelLines.map((line) => {
            return `  \\${line}`;
        }), '\\end{dependency} \\\\');

    log.debug(`generateLaTeX() generated: ${LaTeX}`);
    return LaTeX;
}
