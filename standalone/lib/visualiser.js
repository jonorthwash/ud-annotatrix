'use strict'

var TREE = {}, // This map allows us to address the Token object given an ID
    CURRENT_PAN = {},

    // used for calculating progress
    ALL_WORK = 0,
    DONE_WORK = 0,

    // display options
    IS_VERTICAL = false,
    IS_LTR = true,
    IS_ENHANCED = false,

    // export trackers
    CODE_LATEX = '',
    IS_PNG_EXPORTED = false,
    IS_LATEX_EXPORTED = false,

    // Cytoscape defaults
    CY_OPTIONS = {
        container: $('#cy'),
        boxSelectionEnabled: false,
        autounselectify: true,
        autoungrabify: true,
        zoomingEnabled: true,
        userZoomingEnabled: false,
        wheelSensitivity: 0.1,
        style: CY_STYLE,
        layout: getCyLayout(),
        elements: []
    };

const SCROLL_ZOOM_INCREMENT = 0.05,

    // graph parameters
    EDGE_HEIGHT = 40,
    DEFAULT_COEFF = 1, // 0.7
    STAGGER_SIZE = 15,

    // require lib for CoNLL-U parsing
    conllu = require('conllu');


/**
 * Draws the tree.
 * @param {String} content Content of the input textbox.
 */
function conlluDraw(content) {
    log.debug(`called conlluDraw(${content})`);

    let sent = new conllu.Sentence();
    sent.serial = cleanConllu(content);

    // change box size and edge style
    if (IS_VERTICAL) {
        $('#cy').css('width', `${$(window).width()-10}px`);
        $('#cy').css('height', `${sent.tokens.length * 50}px`);
        $('edge.incomplete').addClass('vertical').removeClass('horizontal');
    } else {
        // scales width according to viewport
        $('#cy').css('width', '100%');
        // window height - height of top area - height of controls
        $('#cy').css('height', `${$(window).height()-$('.inarea').height()-80}px`);
        $('edge.incomplete').addClass('horizontal').removeClass('vertical');
    }

    /*
    // new global cy object
    _.graphOptions.container = $('#cy');
    _.graphOptions.style = CY_STYLE;
    _.graphOptions.layout = getCyLayout();
    _.graphOptions.elements = conllu2cy(sent);
    _.graph = resetCy(_.graphOptions);*/

    CY_OPTIONS.layout = getCyLayout();
    CY_OPTIONS.elements = conllu2cy(sent);
    resetCy(CY_OPTIONS);
}

function resetCy(options) {
    log.critical(`called resetCy(${JSON.stringify(Object.keys(options))})`);
    window.cy = cytoscape(options);

    // zooming, fitting, centering
    cy.minZoom(0.1);
    cy.maxZoom(10.0);
    cy.fit();
    const zoom = cy.zoom();
    CURRENT_ZOOM = (zoom >= 1.7 ? 1.7 : zoom <= 0.7 ? 0.7 : zoom); // pick a reasonable zoom level
    cy.zoom(CURRENT_ZOOM);
    cy.center();

    // bind pan event
    cy.on('pan', () => {

        log.debug(`called cy->onPan(): (old) CURRENT_PAN: ${JSON.stringify(CURRENT_PAN)}`);
        CURRENT_PAN = window.cy.pan();

    });
    cy.pan(CURRENT_PAN);

    // bind some window-level events
    $(window)
        .resize(() => {

            // change browser window size
            log.debug(`called window->resize()`);

            cy.fit();
            cy.resize();
            cy.reset();

            CURRENT_ZOOM = cy.zoom(); // Get the current zoom factor

            if (!IS_VERTICAL)
                $('#cy').css('height', $(window).height()-$('.inarea').height()-80);

            cy.pan(CURRENT_PAN);

        }).bind('DOMMouseScroll wheel mousewheel', (e) => { // different browsers have different events

            const delta = (-e.originalEvent.wheelDelta || e.originalEvent.detail || e.originalEvent.deltaY);
            log.debug(`called window->wheel(delta: ${delta}, shift: ${e.shiftKey})`);

            if (e.shiftKey) {
                CURRENT_ZOOM += (delta < 0 ? 1 : -1) * SCROLL_ZOOM_INCREMENT;
                cy.zoom(CURRENT_ZOOM);
                cy.center();
            } else {
                cy.pan(CURRENT_PAN);
            }

        });

    return window.cy;
}



/**
 * Layout nodes on a grid, condense means.
 * @return {Object} A tree containing formatting.
 */
function getCyLayout() {

    let layout = {
        name: 'tree',
        padding: 0,
        nodeDimensionsIncludeLabels: false
    };

    if (IS_VERTICAL) {
      layout.cols = 2;
      layout.sort = vertAlSort;
    } else {
      layout.rows = 2;
      layout.sort = (IS_LTR ? simpleIdSorting : rtlSorting);
    }

    return layout;
}

function showProgress() {
    log.debug(`called showProgress()`);
    $('#progressBar').animate({ width:`${DONE_WORK/(ALL_WORK-1) * 100}%` });
}

/**
 * Creates a graph out of the conllu.Sentence().
 * @param  {Object} sent A conllu.Sentence().
 * @return {Array}       Returns the graph.
 */
function conllu2cy(sent) {
    log.debug(`called conllu2cy(${sent.serial})`);

    let graph = []; TREE = {};
    $.each(sent.tokens, (i, token) => {
        if (token instanceof conllu.MultiwordToken){

            // NOTE: ns = supertoken
            const superId = `ns${String(i).padStart(2, '0')}`,
                subtokens = token.tokens,
                id = toSubscript(` (${subtokens[0].id}-${subtokens[subtokens.length - 1].id})`);
                MultiwordToken = {
                    data: { id:superId, label:`${token.form}${id}` },
                    classes: 'MultiwordToken'
                };

            graph.push(MultiwordToken);
            $.each(token.tokens, (j, subToken) => {
                graph = createToken(graph, subToken, superToken);
            });

        } else {
            graph = createToken(graph, token);
        }
    });

    if (IS_ENHANCED) {
        $.each(sent.tokens, (i, token) => {
            log.debug(`conllu2cy(): processing enhanced dependency for token: ${token}`);
            $.each(token.deps.split('|'), (j, dep) => {

                const enhancedRow = dep.split(':'),
                    enhancedHead  = parseInt(enhancedRow[0]),
                    enhancedDeprel= enhancedRow.slice(1).join(),
                    nodeId = token.id;

                graph = makeEnhancedDependency(token, nodeId, enhancedHead, enhancedDeprel, graph);
            });
        });
    }

    CODE_LATEX = generateLaTeX(graph);

    ALL_WORK = 0;
    DONE_WORK = 0;
    $.each(graph, (i, node) => {
        if (node.classes === 'wf') {
            ALL_WORK += 2;
            if (node.head !== undefined)
                DONE_WORK += 1;
            if (node.upostag !== undefined)
                DONE_WORK += 1;
        } else if (node.classes.indexOf('dependency') > -1) {
            ALL_WORK += 1;
            if (node.classes !== 'dependency incomplete')
                DONE_WORK += 1;
        }
    });

    return graph;
}

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

/**
 * Converts a string to subscripts.
 * @param  {String} str A string.
 * @return {String}     Returns the subscript conversion of the string.
 */
function toSubscript(str) {
    const subscripts = { 0:'₀', 1:'₁', 2:'₂', 3:'₃', 4:'₄', 5:'₅',
        6:'₆', 7:'₇', 8:'₈', 9:'₉', '-':'₋', '(':'₍', ')':'₎' };

    return str.map((char) => {
        return (subscripts[char] || char);
    });
}

/**
 * Creates the wf node, the POS node and dependencies.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @param  {Object} token  Token object.
 * @param  {String} spId   Id of supertoken.
 * @return {Array}         Returns the graph.
 */
function createToken(graph, token, superTokenId) {
    log.debug(`called createToken(graph: <Graph>, token: ${JSON.stringify(token)}, superTokenId: ${superTokenId})`);

    /* Takes the tree graph, a token object and the id of the supertoken.
    Creates the wf node, the POS node and dependencies. Returns the graph. */

    // handling empty form
    if (token.form === undefined)
        token.form = ' ';

    // TODO: We shouldn't need to hold information in multiple places
    // at least not like this.
    TREE[token.id] = token;

    // token  number
    const nodeId = getNodeId(token.id);
    graph.push({
        data: {
            id: `num${nodeId}`,
            label: token.id,
            pos: token.upostag, // +token.upostag
            parent: superTokenId
        },
        classes: 'tokenNumber'
    });

    let nodeWF = token;
    nodeWF.id = `nf${nodeId}`;
    nodeWF.label = nodeWF.form;
    nodeWF.length = `${nodeWF.form.length > 3 ? nodeWF.form.length*0.7 : nodeWF.form.length}em`;
    nodeWF.state = 'normal';
    nodeWF.parent = `num${nodeId}`;

    graph.push({ data:nodeWF, classes:`wf${token.head === 0 ? ' root' : ''}`});
    graph = makePOS(token, nodeId, graph);

    if (!IS_ENHANCED)
        graph = makeDependencies(token, nodeId, graph);

    return graph;
}

function getNodeId(idString) {
    log.debug(`called getNodeId(${JSON.stringify(idString)})`)
    let id = parseInt(idString);

    if (isNaN(id)) {
        log.warn(`getNodeId(): unable to parse id: ${JSON.stringify(idString)}`);
        return null;
    }

    return String(id).padStart(2, '0');
}

function makeEnhancedDependency(token, nodeId, head, deprel, graph) {
    log.debug(`called makeEnhancedDependency(token: ${JSON.stringify(token)}, nodeId: ${nodeId}, head: ${head}, deprel: ${deprel}, graph: <Graph>)`);

    if (head != 0 && head !== undefined) {
        let edgeHeight = EDGE_HEIGHT * (head - parseInt(nodeId.slice(2)));
        if (Math.abs(coeff) !== 1)
            edgeHeight *= DEFAULT_COEFF;

        const headId = getNodeId(head),
            edgeDep = {
                id: `ed${nodeId}:${headId}`,
                source: `nf${headId}`,
                target: nodeId,
                length: `${deprel.length / 3}em`,
                label: deprel,
                ctrl: new Array(4).fill(edgeHeight) // ARC HEIGHT STUFFS
            };

        log.debug(`makeEnhancedDependency(): edgeDep: ${JSON.stringify(edgeDep)}`);
        graph.push({
            data: edgeDep,
            classes: 'enhanced'
        });
    }

    return graph;
}

/**
 * Creates edges for dependency if head exists.
 * @param  {Object} token  Token object.
 * @param  {String} nodeId Id of node.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @return {Array}         Returns the graph.
 */
function makeDependencies(token, nodeId, graph) {
    log.debug(`called makeDependencies(token: ${JSON.stringify(token)}, nodeId: ${nodeId}, graph: <Graph>)`);

    const deprel = token.deprel || '',
        head = token.head;
    let isValid = false;

    if (head in TREE) // if the pos tag of the head is in the list of leaf nodes, then mark it as an error
        isValid = !is_leaf(TREE[head].upostag);

    if (deprel !== '') // if the deprel is not valid, mark it as an error, unless it's blank
        isValid = is_udeprel(deprel)


  	// Append ⊲ or ⊳ to indicate direction of the arc (helpful if
  	// there are many arcs.
  	let deprelLabel;
  	if (parseInt(head) < parseInt(nodeId) && IS_LTR) {
      	deprelLabel = `${deprel}⊳`;
  	} else if (parseInt(head) > parseInt(nodeId) && IS_LTR) {
    		deprelLabel = `⊲${deprel}`;
  	} else if (parseInt(head) < parseInt(nodeId) && !IS_LTR) {
    		deprelLabel = `⊲${deprel}`;
  	} else if (parseInt(head) > parseInt(nodeId) && !IS_LTR) {
    		deprelLabel = `${deprel}⊳`;
  	}


  	if (token.head != 0 && token.head !== undefined) {

        let edgeHeight = EDGE_HEIGHT * (head - nodeId);
        if (!IS_LTR)
            edgeHeight *= -1;
        if (Math.abs(edgeHeight) !== 1)
            edgeHeight *= DEFAULT_COEFF;
        if (IS_VERTICAL)
            edgeHeight = 45;

        const headId = getNodeId(head);

        if (headId === null)
            return graph;

        const edgeDep = {
                id: `ed${nodeId}`,
                source: `nf${headId}`,
                target: `nf${nodeId}`,
                length: `${deprel.length / 3}em`,
                label: deprelLabel,
                ctrl: new Array(4).fill(edgeHeight) // ARC HEIGHT STUFFS
            };

        log.debug(`makeDependencies(): edgeDep: ${JSON.stringify(edgeDep)}`);

        /*
        if (token.upostag === 'PUNCT' && !is_projective(TREE, [parseInt(nodeId)])) {
            isValid = false;
            log.warn(`makeDependencies(): Non-projective punctuation`);
        }
        */

    		// if it's not valid, mark it as an error (see cy-style.js)
        if (deprel === '' || deprel === undefined) {
            log.debug(`makeDependencies(): incomplete @${deprel}`);
      			graph.push({'data': edgeDep, 'classes': 'dependency incomplete'});
        } else if (!isValid) {
            log.debug(`makeDependencies(): error @${deprel}`);
      			graph.push({'data': edgeDep, 'classes': 'dependency error'});
        } else {
            log.debug(`makeDependencies(): valid @${deprel}`);
      			graph.push({'data': edgeDep, 'classes': 'dependency'});
  		  }


        // If dependency cycle exists, mark the cycle as red.
        const cycles = is_depend_cycles(TREE);
        if (cycles !== null) {
            $.each(cycles, (i, cycle) => {
                $.each(cycle, (j, curr) => {
                    const next = cycle[j+1 >= cycle.length ? 0 : j+1];
                    $.each(graph, (k, node) => {
                        if (node.data.source !== undefined
                            && node.data.target !== undefined
                            && parseInt(node.data.target.substr(2)) === curr
                            && parseInt(node.data.source.substr(2)) === next )
                            node.classes = 'dependency error';
                    });
                });
            });
        }
  	}

  	return graph;
}

/**
 * Creates nodes for POS and edges between wf and POS nodes.
 * @param  {Object} token  Token object.
 * @param  {String} nodeId Id of node.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @return {Array}         Returns the graph.
 */
function makePOS(token, nodeId, graph) {
    log.debug(`called makePOS(token: ${JSON.stringify(token)}, nodeId: ${nodeId}, graph: <Graph>)`);

    /* Creates nodes for POS and edges between wf and POS nodes */
    const POS = token.upostag || token.xpostag || '';
    nodeId = getNodeId(nodeId);

    graph.push({
        data: {
            id: `np${nodeId}`,
            label: POS,
            length: `${POS.length + 1}em`
        },
        classes: 'pos'
    });

    graph.push({
        data: {
            id: `ep${nodeId}`,
            source: `nf${nodeId}`,
            target: `np${nodeId}`
        },
        classes: 'pos'
    });

    return graph;
}


/**
 * Creates a range of numbers in an array, starting at a specified number and
 * ending before a different specified number.
 * @param  {Number} start  Beginning number.
 * @param  {Number} finish Ending number.
 * @param  {Number} step   Step size.
 * @return {Array}         A range from start to finish with a certain step size
 */
function rangeExclusive(start, finish, step) {
    log.debug(`called rangeExclusive(start: ${start}, finish: ${finish}, step: ${step})`);

  	// If only one number was passed in make it the finish and 0 the start.
  	if (arguments.length === 1) {
    		finish = start;
    		start = 0;
  	}

  	// default for the finish and step numbers
  	finish = finish || 0;
  	step = step || 1;

  	// If start is greater than finish, swap
    if (start > finish) {
        const _tmp = start;
        start = finish;
        finish = _tmp;
    }

    // exclude the start
  	start += 1;

    // create an array of numbers, stopping before the finish
    let range = [], current = start;
    while (current < finish) {
        range.push(current);
        current += step;
    }

  	return range;
}

/**
 * Makes the dependency edges easier to see and overlap less.
 */
function cleanEdges() {
    log.debug(`called cleanEdges()`);

    let sources = {}, edges = {};
    $.each(cy.filter('edge[id*="ed"]'), (i, edge) => {
        if (edge.data.source !== edge.data.target) {
            const target = parseInt(edge.data.target.replace('nf',''));
            sources[target] = parseInt(edge.data.source.replace('nf',''));
            edges[target] = edge;
        }
    });

    // calculate max heights
    let maxes = edges.map((edge, i) => {
        return Math.abs(i - sources[i]);
    });
    log.debug(`cleanEdges(): maxes: ${JSON.stringify(maxes)}, sources: ${JSON.stringify(sources)}`);

    // set height to max intervening height + 1
    $.each(edges, (tar, edge) => {
        const src = sources[i],
            diff = Math.abs(tar - src),
            incr = (tar < src ? 1 : -1);

        let height = 1;

        if (diff > 1) {
            let max = 1;

            const highest = Math.max(tar, src),
                lowest = Math.min(tar, src);

            $.each(rangeExclusive(tar, src, Math.abs(incr)), (i, j) => {
                max = Math.max(max, maxes[j]);
            });

            height = max + 1;
            maxes[i] = height;
        }

        // adjust w/ our parameters
        height *= EDGE_HEIGHT * DEFAULT_COEFF;
        setEdgePosition(edge, height, incr, diff);
    });
    log.debug(`cleanEdges(): sources: ${JSON.stringify(sources)}`);

  	// go back through and test if any intervening nodes have arcs that cross this one
    $.each(edges, (tar, edge) => {
        const src = sources[i],
            diff = Math.abs(tar - src);

        let stagger = 0;

        if (diff > 1) {
            const max = maxes[tar];
            $.each(rangeExclusive(tar, src, 1), (i, j) => {
                if (maxes[j] === max + j || maxes[j] === undefined)
                    stagger = STAGGER_SIZE;
            });
        }

        const height = edge.data.ctrl[0] + stagger;
        log.debug(`cleanEdges(): should we do something here? height: ${height}`);
        // setEdgePosition(edge, height, 1);
    });
}

/**
 * Sets the position of an edge.
 * @param {Object} edge       The edge being positioned.
 * @param {Number} height     The height the edge should be positioned at.
 * @param {Number} coeff      The direction the edge is going: either -1 or 1.
 * @param {Number} diff       How far the edge stretches between nodes.
 */
function setEdgePosition(edge, height, coeff, diff) {
    log.debug(`called setEdgePosition(edge: ${JSON.stringify(edge)}, height: ${height}, coeff: ${coeff}, diff: ${diff})`);

    if (!IS_LTR) // support for RTL
        coeff *= -1;
    if (IS_VERTICAL) // so the ctrl points are better placed
        height += 30;

    height *= coeff;

    // const factor = 2 - Math.abs(height) / EDGE_HEIGHT/10;
    // const factor = 1 + (Math.abs(height) - EDGE_HEIGHT) / EDGE_HEIGHT / 10;
    // const factor = 1 + EDGE_HEIGHT**2 / Math.abs(height) / 80
    const factor = 10 * EDGE_HEIGHT / Math.abs(height);
    edge.style({ 'control-point-weights': `${diff === 1 ? 0.15 : 0.01*factor} 0.25 0.75 1` });
    edge.data({ 'ctrl': [(diff === 1 ? height/1.25 : height), height, height, height] });

    if (!IS_VERTICAL) {
        edge.style({
            'source-endpoint': `${-10*coeff}px -50%`,
            'target-endpoint': `0% -50%`
        });
    } else {
        edge.style({
            'source-distance-from-node': `${String(parseInt(edge.data.source.replace('nf', ''))).length*10}px`,
            'target-distance-from-node': `${String(parseInt(edge.data.target.replace('nf', ''))).length*10}px`,
        });
    }
}

function simpleIdSorting(n1, n2) {
    log.debug(`called simpleIdSorting(${n1.id()}, ${n2.id()})`);

    if (n1.id() < n2.id()) {
        return -1;
    } else if (n1.id() > n2.id()) {
        return 1;
    } else {
        return 0;
    }
}


function rtlSorting(n1, n2) {
    log.debug(`called rtlSorting(${n1.id()}, ${n2.id()})`);

    if ((n1.hasClass('wf') && n2.hasClass('wf')) // if the nodes have the same class
        || (n1.hasClass('pos') && n2.hasClass('pos'))) {
        return simpleIdSorting(n1, n2) * -1;
    } else if (n1.hasClass('wf') && n2.hasClass('pos')) {
        return -1;
    } else if (n1.hasClass('pos') && n2.hasClass('wf')) {
        return 1;
    } else {
        return 0;
    }
}


function vertAlSort(n1, n2) {
    log.debug(`called vertAlSort(${n1.id()}, ${n2.id()})`);

    const num1 = parseInt(n1.id().slice(2)),
        num2 = parseInt(n2.id().slice(2));

    if (num1 !== num2) {
        return num1 - num2;
    } else {
        if (n1.hasClass('wf') && n2.hasClass('pos')) {
            return 1;
        } else if (n1.hasClass('pos') && n2.hasClass('wf')) {
            return -1
        } else {
            return 0;
        }
    }
}



/* TODO:

var nodeWF = Object.create(token);
...
nodePOS = Object.create(token);
...

*/
