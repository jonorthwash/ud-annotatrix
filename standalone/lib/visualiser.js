'use strict'

var CURRENT_PAN = {},

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

    if (cy && cy.pan && cy.zoom) {
        _.pan  = cy.pan();
        _.zoom = cy.zoom();
    }

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

    window.cy = cytoscape(_.graph_options)
        .minZoom(0.1)
        .maxZoom(10.0)
        .fit()
        .zoom(_.zoom)
        .center()
        .pan(_.pan);

    bindCyHandlers();

    /*$('#cy').prepend(
        $(`<div id="mute">
              <input type="type" id="edit" class="hidden-input" />
          </div>`));*/


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
 * Creates a graph (nodes=tokens, etc.; edges=dependencies, etc.) out of the _.tokens()
 * @return {Array}    cytoscape elements array
 */
function getGraphElements() {
    log.debug(`called getGraphElements()`);

    // first make the nodes
    let graph = [], num = 0;
    $.each(_.tokens(), (i, token) => {
        if (token instanceof conllu.MultiwordToken) {

            // create supertoken
            createToken(graph, num, token, i, null, null);
            num++;

            $.each(token.tokens, (j, subToken) => {
                createToken(graph, num, token, i, subToken, j);
                num++;
            });

        } else {
            createToken(graph, num, token, i);
            num++;
        }
    });

    // then make the edges
    $.each(_.tokens(), (i, token) => {
        createDependency(graph, token);
        $.each(token.tokens, (i, subToken) => {
            createDependency(graph, subToken);
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
/**
 * Creates the wf node, the POS node and dependencies.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @param  {Number} num  Index of this token in the cy elements array (see note below).
 * @param  {Object} superToken  Token object (that may or may not have subTokens).
 * @param  {Number} superTokenId  Integer representing superToken's index in the conllu.
 * @param  {Object} subToken  Token object (see note below) || undefined || null.
 * @param  {Number} subTokenId  Integer representing subToken's index in the conllu || undefined || null.
 */
function createToken(graph, num, superToken, superTokenId, subToken, subTokenId) {
    log.debug(`called createToken(num: ${num}, superTokenId: ${superTokenId}, subTokenId: ${subTokenId})`);

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

    // save the data for the createDependency() functions
    token.num = num;
    token.superTokenId = superTokenId;
    token.subTokenId = subTokenId === undefined ? null : subTokenId;

    // number node
    graph.push({
        data: {
            id: `num-${token.id}`,
            name: 'number',
            label: token.id,
            pos: token.upostag || null,
            parent: token.id
        },
        classes: 'number'
    });

    // form node
    let label = token.form;
    if (token.tokens)
        label += toSubscript(`${token.tokens[0].id}-${token.tokens[token.tokens.length - 1].id}`);
    graph.push({
        data: {
            id: `form-${token.id}`,
            num: num,
            name: `form`,
            attr: 'form',
            form: token.form,
            label: label,
            length: `${label.length > 3 ? label.length * 0.7 : label.length}em`,
            state: 'normal',
            parent: `num-${token.id}`,
            conllu: token
        },
        classes: `form${token.head == 0 ? ' root' : ''}`
    });

    // pos node
    graph.push({
        data: {
            id: `pos-node-${token.id}`,
            num: num,
            name: `pos-node`,
            attr: 'upostag',
            label: token.pos || '',
            length: `${token.pos.length * 0.7 + 1}em`,
            conllu: token
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

    //if (!IS_ENHANCED)
        //graph = makeDependencies(token, nodeId, graph);

}
/**
 * Creates edges for dependency if head exists.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @param  {Object} token  Token object.
 */
function createDependency(graph, token) {
    log.debug(`called createDependency(token: ${JSON.stringify(token)}`);

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
        log.error(`createDependency(): invalid dependency for conllu token: ${token.id}`);
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
          name: 'dependency',
          attr: 'deprel',
          source: `form-${token.id}`,
          sourceConllu: token,
          target: `form-${head.id}`,
          targetConllu: head,
          length: `${deprel.length / 3}em`,
          label: deprelLabel,
          ctrl: new Array(4).fill(edgeHeight)
        },
        classes: classes
    });
}
/**
 *  NOT IMPLEMENTED, not sure when this would be used??
 */
function createEnhancedDependency(graph, token) {
    log.debug(`called makeEnhancedDependency(token: ${JSON.stringify(token)})`);

    throw new NotImplementedError('createEnhancedDependency() not implemented');
    /*
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

    return graph;*/
}
/**
 * ~~ helper function for createToken()
 * Converts a string to subscripts.
 * @param  {String} str A string.
 * @return {String}     Returns the subscript conversion of the string.
 */
function toSubscript(str) {
    log.debug(`called toSubscript(${str})`);

    const subscripts = { 0:'₀', 1:'₁', 2:'₂', 3:'₃', 4:'₄', 5:'₅',
        6:'₆', 7:'₇', 8:'₈', 9:'₉', '-':'₋', '(':'₍', ')':'₎' };

    return str.split('').map((char) => {
        return (subscripts[char] || char);
    }).join('');
}
/**
 *  ~~ helper function for createDependency() and createEnhancedDependency()
 *  Returns the edge height between two nodes (their positions are given as indices
 *  into the cy elements array).
 *  @param  {Number}  tokenNumber  index of the depending token
 *  @param  {Number}  headNumber   index of the depended-on token
 *  @return {Number}
 */
function getEdgeHeight(tokenNumber, headNumber) {
    log.debug(`called getEdgeHeight(depender: ${tokenNumber}, depends on: ${headNumber})`);

    const defaultEdgeHeight = 40,
        defaultEdgeCoeff = 1; // 0.7

    let edgeHeight = defaultEdgeHeight * (headNumber - tokenNumber);
    if (_.is_ltr)
        edgeHeight *= -1;
    if (Math.abs(edgeHeight) !== 1)
        edgeHeight *= defaultEdgeCoeff;
    if (_.is_vertical)
        edgeHeight = 45;

    log.debug(`getEdgeHeight(): ${edgeHeight}`);

    return edgeHeight;
}
/**
 *  ~~ helper function for createDependency and createEnhancedDependency()
 *  Returns the token pointed to by a given CoNLL-U index-string
 *  @param  id  string giving the index for a CoNLL-U token
 *  @return {Token || null}
 */
function getConlluById(id) {
    log.debug(`called getConlluById(${id})`);
    for (let i = 0, t = _.conllu().tokens.length; i < t; i++) {
        const token = _.conllu().tokens[i];
        for (let j = 0, u = (token.tokens || []).length; j < u; j++) {
            const subToken = token.tokens[j];
            if (subToken.id == id)
                return token; // subtokens return their supertoken
        }
        if (token.id == id)
            return token;
    }
    return null;
}

function editGraphLabel(target) {
		log.debug(`called editGraphLabel(${target.attr('id')})`);

		target.addClass('input');

		// get rid of direction arrows
		const label = target.data('label').replace(/[⊳⊲]/, '');
		target.data('label', label);

		// get bounding box
		let bbox = target.renderedBoundingBox();
		bbox.color = target.style('background-color');
		if (target.data('name') === 'dependency') {
				bbox.w = 100;
				bbox.h = cy.nodes()[0].renderedHeight();
				bbox.color = 'white';

				if (_.is_vertical) {
						bbox.y1 += (bbox.y2 - bbox.y1)/2 - 15;
						bbox.x1  = bbox.x2 - 70;
				} else {
						bbox.x1 += (bbox.x2 - bbox.x1)/2 - 50;
				}
		}

		// TODO: rank the labels + make the style better
		const autocompletes = target.data('name') === 'pos-node'
				? U_POS
				: target.data('name') === 'dependency'
				? U_DEPRELS
				: [];

		// add the edit input
		$('#edit')
        .val('')
        .focus()
				.val(label)
				.css('top', bbox.y1)
				.css('left', bbox.x1)
				.css('height', bbox.h)
				.css('width', bbox.w + 5)
				.attr('target', target.attr('id'))
				.addClass('activated')
        .selfcomplete({
    				lookup: autocompletes,
    				tabDisabled: false,
    				autoSelectFirst: true,
    				lookupLimit: 5 });

    /*
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStartBefore($('#edit').first()[0]);
    range.setEndAfter($('#edit').last()[0]);
    selection.removeAllRanges();
    selection.addRange(range);

    /*
    var $newSelection = $('.someElements');
    var selection = window.getSelection();
    var range = document.createRange();
    range.setStartBefore($newSelection.first()[0]);
    range.setEndAfter($newSelection.last()[0]);
    selection.removeAllRanges();
    selection.addRange(range);
    const range = new Range(),
        input = $('#edit')[0]; // DOM node
    range.setStart(input, 0);//label.length);
    range.setEnd(input, 0);//label.length);
    input.setSelectionRange(range);*/

    console.log(document.getSelection())
		// add the background-mute div
		$('#mute').addClass('activated')
				.css('height', _.is_vertical
						? `${_.tokens().length * 50}px`
						: $(window).width() - 10);

		if (target.data('name') === 'dependency')
				$('#edit').select();
}
function saveGraphEdits() {
		log.debug(`called saveGraphEdits(target:${_.editing ? _.editing.attr('id') : 'null'}, text:${_.editing ? $('#edit').val() : ''})`);

		cy.$('.input').removeClass('input');

		if (_.editing === null)
				return; // nothing to do

    const conllu = _.editing.data().conllu || _.editing.data().sourceConllu;
    const newAttrKey = _.editing.data().attr;
		const newAttrValue = $('#edit').val();
    log.debug(`saveGraphEdits(): ${newAttrKey} set =>"${newAttrValue}", whitespace:${/[ \t\n]+/g.test(newAttrValue)}`);

		// check we don't have any whitespace
		if (/[ \t\n]+/g.test(newAttrValue)) {
				const message = 'ERROR: Unable to add changes with whitespace!  Try creating a new node first.';
				log.error(message);
				alert(message); // TODO: probably should streamline errors
				_.editing = null;
				return;
		}

		const oldAttrValue = modifyConllu(conllu.superTokenId, conllu.subTokenId, newAttrKey, newAttrValue);
		window.undoManager.add({
				undo: () => {
						modifyConllu(conllu.superTokenId, conllu.subTokenId, newAttrKey, oldAttrValue);
				},
				redo: () => {
						modifyConllu(conllu.superTokenId, conllu.subTokenId, newAttrKey, newAttrValue);
				}
		});

		_.editing = null;
}

function makeDependency(source, target) {
		log.debug(`called makeDependency(${source.attr('id')}=>${target.attr('id')})`);
		/**
		 * Called by clicking a form-node while there is already an active form-node.
		 * Changes the text data and redraws the graph. Currently supports only conllu.
		 */

		source = source.data('conllu');
		target = target.data('conllu');

		if (source.superTokenId === target.superTokenId) {
				log.warn(`makeDependency(): unable to create dependency within superToken ${source.superTokenId}`);
				return;
		}

		const oldHead = modifyConllu(source.superTokenId, source.subTokenId, 'head', target.id);

		window.undoManager.add({
				undo: () => {
						modifyConllu(source.superTokenId, source.subTokenId, 'head', oldHead);
				},
				redo: () => {
						modifyConllu(source.superTokenId, source.subTokenId, 'head', target.id);
				}
		});

		return;
		/*
		// TODO:
		// If the target POS tag is PUNCT set the deprel to @punct [99%]
		// IF the target POS tag is CCONJ set the deprel to @cc [88%]
		// IF the target POS tag is SCONJ set the deprel to @mark [86%]
		// IF the target POS tag is DET set the deprel to @det [83%]

		const POS_TO_REL = {
				'PUNCT': 'punct',
				'DET': 'det',
				'CCONJ': 'cc',
				'SCONJ': 'mark'
		}

		// TODO: Put this somewhere better
		if (thisToken.upostag in POS_TO_REL)
				sentAndPrev = changeConlluAttr(sent, indices, 'deprel', POS_TO_REL[thisToken.upostag]);

		let isValidDep = true;
		if (thisToken.upostag === 'PUNCT' && !is_projective_nodes(sent.tokens, [targetIndex])) {
				log.warn('writeArc(): Non-projective punctuation');
				isValidDep = false
		}*/
}

function modifyConllu(superTokenId, subTokenId, attrKey, attrValue) {
		log.error(`called modifyConllu(superTokenId:${superTokenId}, subTokenId:${subTokenId}, attr:${attrKey}=>${attrValue})`);

		const conllu = _.conllu();
		log.debug(`modifyConllu(): before:  ${conllu.tokens[superTokenId][attrKey]}`);

		let oldValue;
		if (subTokenId !== null) {
				oldValue = conllu.tokens[superTokenId].tokens[subTokenId][attrKey] || '_';
				conllu.tokens[superTokenId].tokens[subTokenId][attrKey] = attrValue;
		} else {
				oldValue = conllu.tokens[superTokenId][attrKey] || '_';
				conllu.tokens[superTokenId][attrKey] = attrValue;
		}

		log.debug(`modifyConllu(): during: ${conllu.tokens[superTokenId][attrKey]}`);
		const text = conllu.serial;
		$('#text-data').val(text);
		parseText();
		log.debug(`modifyConllu(): after:  ${_.conllu().tokens[superTokenId][attrKey]}`);

		// return oldValue for undo/redo purposes
		return oldValue;
}













// UNUSED / OLD functions, maybe to be resurrected :)



function getNodeId(idString) {
    log.debug(`called getNodeId(${JSON.stringify(idString)})`)
    let id = parseInt(idString);

    if (isNaN(id)) {
        log.warn(`getNodeId(): unable to parse id: ${JSON.stringify(idString)}`);
        return null;
    }

    return String(id).padStart(2, '0');
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
