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
    IS_LATEX_EXPORTED = false;


const SCROLL_ZOOM_INCREMENT = 0.05,

    // graph parameters
    EDGE_HEIGHT = 40,
    DEFAULT_COEFF = 1, // 0.7
    STAGGER_SIZE = 15;


function updateGraph() {
    log.warn(`called updateGraph()`);

    // can't do anything without CoNLL-U
    convert2Conllu();
    if (_.graph_disabled || _.conllu() === null)
        return;

    _.graph_options.layout = {
        name: 'tree',
        padding: 0,
        nodeDimensionsIncludeLabels: false,
        cols: (_.is_vertical ? 2 : undefined),
        rows: (_.is_vertical ? undefined : 2),
        sort: (_.is_vertical ? vertAlSort
            : _.is_ltr ? simpleIdSorting : rtlSorting )
    };
    _.graph_options.elements = getGraphElements();

    window.cy = cytoscape(_.graph_options);

    cy.minZoom(0.1)
        .maxZoom(10.0)
        .fit()
        .center()
        .zoom();

    bindCyHandlers();

    /*
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
    });*/

    return;
}

/**
 * Creates a graph out of the _.conllu().Sentence().
 * @return {Array}    cytoscape elements array
 */
function getGraphElements() {
    log.debug(`called getGraphElements()`);

    // first make the nodes
    let graph = [], num = 0;
    $.each(_.tokens(), (i, token) => {
        if (token instanceof conllu.MultiwordToken) {

            // create supertoken
            _createToken(graph, num, token, i, null, null);
            num++;

            $.each(token.tokens, (j, subToken) => {
                _createToken(graph, num, token, i, subToken, j);
                num++;
            });

        } else {
            _createToken(graph, num, token, i);
            num++;
        }
    });

    // then make the edges
    $.each(_.tokens(), (i, token) => {
        createDependencies(graph, token);
        $.each(token.tokens, (i, subToken) => {
            createDependencies(graph, subToken);
        })
    });

    // save the graph elements to the data structure
    _.graph(graph);
    return graph;

    /*

    if (IS_ENHANCED) {
        $.each(sent.tokens, (i, token) => {
            log.debug(`getGraphElements(): processing enhanced dependency for token: ${token}`);
            $.each(token.deps.split('|'), (j, dep) => {

                const enhancedRow = dep.split(':'),
                    enhancedHead  = parseInt(enhancedRow[0]),
                    enhancedDeprel= enhancedRow.slice(1).join(),
                    nodeId = token.id;

                graph = makeEnhancedDependency(token, nodeId, enhancedHead, enhancedDeprel, graph);
            });
        });
    }

    return graph; */
}

function _createToken(graph, num, superToken, superTokenId, subToken, subTokenId) {
    log.debug(`called _createToken(num: ${num}, superTokenId: ${superTokenId}, subTokenId: ${subTokenId})`);

    /*
     * NOTE on args:
     * - $num refers to the index in our graph data structure ... if there are no
     *     MultiwordTokens, then this should be 1 less than the internal 'id'
     *     field on the CoNLL-U token
     * - if $subToken is undefined, then we're creating a normal token
     * - if $subToken is null, then we're creating a superToken
     * - if $subToken is an Object, then we're creating a subToken
     *
     * although it's more complicated here, i think streamlining the indexing
     * scheme is important for maintaining compatibility b/w the text-based
     * data structure and the graph-based one
     */

    const token = (subToken || superToken);

    token.form = token.form || ' ';
    token.pos = token.upostag || token.xpostag || '';

    // save the data for the createDependencies() functions
    token.num = num;
    token.superTokenId = superTokenId;
    token.subTokenId = subTokenId;

    // number node
    graph.push({
        data: {
            id: `num-${token.id}`,
            label: token.id,
            pos: token.upostag || null,
            parent: token.id
        },
        classes: 'number'
    });

    // form node
    const label = `${token.form}${ subToken !== null ? '' // only do the subscript thing for superTokens
        : toSubscript(` ${token.tokens[0].id}-${token.tokens[token.tokens.length - 1].id}`)}`;
    graph.push({
        data: {
            id: `form-${token.id}`,
            num: num,
            name: `form`,
            form: token.form,
            label: label,
            length: `${label.length > 3 ? label.length * 0.7 : label.length}em`,
            state: 'normal',
            parent: `num-${token.id}`,
            conlluId: token.id,
            superTokenId: superTokenId,
            subTokenId: subTokenId
        },
        classes: `form${token.head === 0 ? ' root' : ''}`
    });

    // pos node
    graph.push({
        data: {
            id: `pos-node-${token.id}`,
            num: num,
            name: `pos-node`,
            label: token.pos,
            length: `${token.pos.length * 0.7 + 1}em`,
            conlluId: token.id,
            superTokenId: superTokenId,
            subTokenId: subTokenId
        },
        classes: 'pos'
    });

    // pos edge
    graph.push({
        data: {
            id: `pos-edge-${token.id}`,
            name: `pos-edge`,
            source: `form-${token.id}`,
            target: `pos-node-${token.id}`
        },
        classes: 'pos'
    });

}

/**
 * Creates edges for dependency if head exists.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @param  {Object} token  Token object.
 */
function createDependencies(graph, token) {
    log.debug(`called createDependencies(token: ${JSON.stringify(token)}`);

    let deprel = token.deprel || '',
        head = getConlluById(token.head);

    // if no head, no dependency
    if (!head) return;

    // Append ⊲ or ⊳ to indicate direction of the arc (helpful if there are many arcs)
    let deprelLabel;
    if (_.is_ltr) {
        deprelLabel = head.num < token.num ? `${deprel}⊳` : `⊲${deprel}`;
    } else {
        deprelLabel = head.num < token.num ? `⊲${deprel}` : `${deprel}⊳`;
    }

    const edgeHeight = getEdgeHeight(token.num, head.num);

    // if the pos tag of the head is in the list of leaf nodes, then mark it as an error
    let isValid = is_leaf(head.upostag).err && is_udeprel(deprel || 'acl').err === null;

    // give it classes (see cy-style.js)
    let classes;
    if (!isValid) {
        classes = 'dependency error';
    } else if (!deprel || !deprel.length) {
        classes = 'dependency incomplete';
    } else {
        classes = 'dependency';
    }

    /*
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
                        classes = 'dependency error';
                });
            });
        });
    }*/

    graph.push({
        data: {
          id: `dep-${token.id}`,
          source: `form-${token.id}`,
          target: `form-${head.id}`,
          length: `${deprel.length / 3}em`,
          label: deprelLabel,
          ctrl: new Array(4).fill(edgeHeight)
        },
        classes: classes
    });
}

function getEdgeHeight(tokenNumber, headNumber) {
    log.debug(`called getEdgeHeight(depender: ${tokenNumber}, depends on: ${headNumber})`);

    let edgeHeight = EDGE_HEIGHT * (headNumber - tokenNumber);
    if (_.is_ltr)
        edgeHeight *= -1;
    if (Math.abs(edgeHeight) !== 1)
        edgeHeight *= DEFAULT_COEFF;
    if (_.is_vertical)
        edgeHeight = 45;

    log.debug(`getEdgeHeight(): ${edgeHeight}`);

    return edgeHeight;
}

function getConlluById(id) {
    log.debug(`called getConlluById(${id})`);
    for (let i = 0, t = _.conllu().tokens.length; i < t; i++) {
        const token = _.conllu().tokens[i];
        if (token.id == id)
            return token;
    }
    return null;
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

    return str.split('').map((char) => {
        return (subscripts[char] || char);
    }).join('');
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

function cyGetIndex(ele) {
    // NB: sorting will break if sentence has more than this many tokens
    const LARGE_NUMBER = 10000,
        id = parseInt(ele.data('num')),
        offset = (ele.data('name') === 'pos-node' || ele.data('name') === 'super-dummy') ? LARGE_NUMBER : 0;

    return isNaN(id) ? -Infinity : id + offset;
}

function simpleIdSorting(n1, n2) {
    log.debug(`called simpleIdSorting(${n1.id()}, ${n2.id()})`);

    const num1 = cyGetIndex(n1);
    const num2 = cyGetIndex(n2);

    log.debug(`simpleIdSorting(): comparing: ${num1} and ${num2}`);
    return (num1 === num2 ? 0 : num1 < num2 ? -1 : 1);
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
    _.graphOptions.elements = getGraphElements(sent);
    _.graph = updateGraph(_.graphOptions);*/

}




function showProgress() {
    log.debug(`called showProgress()`);
    $('#progressBar').animate({ width:`${DONE_WORK/(ALL_WORK-1) * 100}%` });
}


/* TODO:

var nodeWF = Object.create(token);
...
nodePOS = Object.create(token);
...

*/
