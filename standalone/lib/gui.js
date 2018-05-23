'use strict'

/*
This scripts contains makes support for graphical editing.
*/

const KEYS = {
		DELETE: 46,
		BACKSPACE: 8,
		ENTER: 13,
		ESC: 27,
		TAB: 9,
		RIGHT: 39,
		LEFT: 37,
		UP: 38,
		DOWN: 40,
		MINUS: 189,
		EQUALS: 187, // also PLUS
		J: 74,
		K: 75,
		D: 68,
		I: 73,
		S: 83,
		R: 82,
		M: 77,
		P: 80,
		SIDES: {
				39: 'right',
				37: 'left'
		}
}
const POS_TO_REL = {
	'PUNCT': 'punct',
	'DET': 'det',
	'CCONJ': 'cc',
	'SCONJ': 'mark'
}

var CURRENT_ZOOM = 1.0;
var IS_EDITING = false;


function setUndos(undoManager) {
    log.debug('called setUndos()');

    const updateUI = () => {
        log.debug('called updateUI()');
        btnUndo.prop('disabled', !undoManager.hasUndo());
        btnRedo.prop('disabled', !undoManager.hasRedo());
    }

    const btnUndo = $('#btnUndo').click(() => {
        log.debug('clicked undo');
        undoManager.undo();
        updateUI();
    });
    const btnRedo = $('#btnRedo').click(() => {
        log.debug('clicked redo');
        undoManager.redo();
        updateUI()
    });

    undoManager.setCallback(updateUI);

    updateUI();
}

function bindHandlers() {
    /* Binds handlers to DOM elements. */

    // TODO: causes errors if called before the cy is initialised
    $(document).keydown(keyDownClassifier);

    $('#btnUploadCorpusFileButton').click(handleUploadButtonPressed);
    $('#btnPrevSentence').click(prevSenSent);
    $('#btnNextSentence').click(nextSenSent);
    $('#btnRemoveSentence').click(removeCurSent);
    $('#btnAddSentence').click(addSent);
    $('#btnExportCorpus').click(exportCorpora);
    //$('#btnSaveServer').click(saveOnServer);
    $('#btnDiscardCorpus').click(clearCorpus);
		$('#btnHelp').click(showHelp);
    $('#tabConllu').click(viewAsConllu);
    $('#tabCG3').click(viewAsCG);
    $('#btnViewTable').click(toggleTableView);
    $('#btnViewText').click(toggleCodeWindow);
    $('#inputCurrSentence').blur(goToSenSent);

    $('#btnExportPNG').click(exportPNG);
    $('#btnExportSVG').click(exportSVG);
    $('#btnExportLaTeX').click(exportLaTeX);

    $('#text-data')
        .keyup(drawTree)
        .keyup(focusOut)
        .keyup(formatTabsView)

    $('#RTL').click(switchRtlMode);
    $('#vertical').click(switchAlignment);
    $('#enhanced').click(switchEnhanced);

    $('#filename').change(loadFromFile);
}

function bindCyHandlers() {
		log.debug('called bindCyHandlers()');

    /* Binds event handlers to cy elements.
    NOTE: If you change the style of a node (e.g. its selector) then
    you also need to update it here. */
    cy.on('click', 'node.wf', clickWF);
    cy.on('cxttapend', 'edge.dependency', selectArc);
    cy.on('click', 'node.pos', changeNode);
    cy.on('click', '$node > node', selectSup);
    cy.on('cxttapend', 'node.wf', changeNode);
    cy.on('click', 'edge.dependency', changeNode);
		// cy.on('zoom', cy.center); // center the view port when the page zoom is changed
}



function clickWF(evt) {
    log.debug(`called clickWF(id: ${this.attr('id')}) on an ${this.hasClass('activated') ? '' : 'in'}active node`);

    /* Called when a node is clicked. */

    // if the user clicked an activated node
    if (this.hasClass('activated')) {

        this.removeClass('activated');

    } else {

        // look for other activated nodes
        let source = cy.$('.activated');

        this.addClass('activated');

        // if there is an activated node already
        if (source.length === 1)
            writeArc(source, this);
    };
}


function writeArc(source, target) {
    log.debug(`called writeArc(source id: ${source.attr('id')}, target id:${target.attr('id')}`);

    /*
    Called in clickWF. Makes changes to the text data and calls the function
    redrawing the tree. Currently supports only conllu.
    */

    // NOTE: can just define a new attr `index` or something on the DOM
    const sourceIndex = parseInt(source.attr('id').slice(2));
    const targetIndex = parseInt(target.attr('id').slice(2));

    const indices = findConlluId(target);

    let sent = buildSent(),
        thisToken = sent.tokens[indices.outer],
        sentAndPrev = changeConlluAttr(sent, indices, 'head', sourceIndex);

    // If the target POS tag is PUNCT set the deprel to @punct [99%]
    // IF the target POS tag is CCONJ set the deprel to @cc [88%]
    // IF the target POS tag is SCONJ set the deprel to @mark [86%]
    // IF the target POS tag is DET set the deprel to @det [83%]
    // TODO: Put this somewhere better
    if (thisToken.upostag in POS_TO_REL)
        sentAndPrev = changeConlluAttr(sent, indices, 'deprel', POS_TO_REL[thisToken.upostag]);

    let isValidDep = true;
    if (thisToken.upostag === 'PUNCT' && !is_projective_nodes(sent.tokens, [targetIndex])) {
        log.warn('writeArc(): Non-projective punctuation');
        isValidDep = false
    }

    window.undoManager.add({
        undo: () => {
            let sent = buildSent(),
                sentAndPrev = changeConlluAttr(sent, indices, 'head', sentAndPrev.previous);
            redrawTree(sentAndPrev.sentence);
        },
        redo: () => {
            writeArc(source, target);
        }
    });

    redrawTree(sent);
}


function removeArc(targets) {
    log.debug('called removeArc()');

    /* Removes all the selected edges. */

    let sent = buildSent(),
        prevRelations = {};

    // support for multiple arcs
    $.each(targetNodes, (i, target) => {
        const targetIndex = target.attr('id').slice(2),
            indices = findConlluId(target);

        let sentAndPrev = changeConlluAttr(sent, indices, 'head', undefined);

        sent = sentAndPrev.sentence;
        prevRelations.head = sentAndPrev.previous;
        sentAndPrev = changeConlluAttr(sent, indices, 'deprel', undefined);
        sent = sentAndPrev.sentence;
        prevRelations.deprel = sentAndPrev.previous;

    });

    window.undoManager.add({
        undo: () => {
            let sent = buildSent();
            $.each(targetNodes, (i, target) => {
                const targetIndex = target.attr('id').slice(2),
                    indices = findConlluId(target);

                let sentAndPrev = changeConlluAttr(sent, indices, 'head', prevRelations.head);
                sent = sentAndPrev.sentence;
                sentAndPrev = changeConlluAttr(sent, indices, 'deprel', prevRelations.deprel);
                sent = sentAndPrev.sentence;
            });

            redrawTree(sent);
        },
        redo: () => {
            removeArc(targets);
        }
    });

    redrawTree(sent);
}


function selectArc() {
    log.debug(`called selectArc(id: ${this.attr('id')}) on an ${this.hasClass('selected') ? '' : 'un'}selected arc`);

    /*
     * Activated when an arc is selected. Adds classes showing what is selected.
     */

    if (!IS_EDITING) {

        const targetIndex = this.data('target');

        // if the user clicked an activated node
        if (this.hasClass('selected')) {

            this.removeClass('selected');
            cy.$(`#${targetIndex}`).removeClass('arc-selected'); // removing visual effects from targetNode

        } else {

            this.addClass('selected');
            cy.$(`#${targetIndex}`).addClass('arc-selected'); // css for targetNode

        }

        // for identifying the node
        cy.$(`#${targetIndex}`).data('state', 'arc-dest');
    }
}


function selectSup() {
    log.debug(`called selectSup(id: ${this.attr('id')}, hasClass('supAct'): ${this.hasClass('supAct')}) `);
    this.toggleClass('supAct');
}


function keyDownClassifier(key) {
    log.debug(`called keyDownClassifier(${key.which})`);

    // looking if there are selected arcs
    const selArcs = cy.$('edge.dependency.selected'),  // + cy.$('edge.dependency.error');
        targetNodes = cy.$('node[state="arc-dest"]'),
        // looking if there is a POS label to be modified
        posInp = $('.activated.np'),
        // looking if there is a wf label to be modified
        wfInp = $('.activated.nf'),
        // looking if there is a deprel label to be modified
        deprelInp = $('.activated.ed'),
        // looking if some wf node is selected
        wf = cy.$('node.wf.activated'),
        // looking if a supertoken node is selected
        st = cy.$('.supAct'),
        // looking if some node waits to be merged
        toMerge = cy.$('.merge'),
        // looking if some node waits to be merged to supertoken
        toSup = cy.$('.supertoken');

    // $(document).bind('keydown', function(e) {
    //     if (key.which === KEYS.ESC) {
    //         e.preventDefault();
    //         drawTree();
    //     }
    // });

    if (key.which === KEYS.ESC) {
        key.preventDefault();
        drawTree();
    }

    if ($('#edit').is(':focus')) {
        if (key.which === KEYS.TAB) {
            key.preventDefault();
        }
    }

    if (selArcs.length) {
        if (key.which === KEYS.DELETE || key.which === KEYS.BACKSPACE) {
            removeArc(targetNodes);
        } else if (key.which === KEYS.D) {
            moveArc();
        };
    } else if (posInp.length) {
        if (key.which === KEYS.ENTER) {
            writePOS(posInp.val());
        };
    } else if (wfInp.length) {
        if (key.which === KEYS.ENTER) {
            writeWF(wfInp);
        };
    } else if (deprelInp.length) {
        if (key.which === KEYS.ENTER) {
            var res = deprelInp.val();
            // to get rid of the magic direction arrows
            res = res.replace(/[⊳⊲]/, '');
            writeDeprel(res);
        };
    } else if (wf.length === 1) {
        if (key.which === KEYS.M) {
            wf.addClass('merge');
            wf.removeClass('activated');
        } else if (key.which === KEYS.S) {
            wf.addClass('supertoken');
            wf.removeClass('activated');
        } else if (key.which === KEYS.R) {
            setRoot(wf);
        };
    } else if (toMerge.length) {
        if (key.which in KEYS.SIDES) {
            mergeNodes(toMerge, KEYS.SIDES[key.which], 'subtoken');
        }
    } else if (toSup.length) {
        if (key.which in KEYS.SIDES) {
            mergeNodes(toSup, KEYS.SIDES[key.which], 'supertoken');
        }
    } else if (st.length) {
        if (key.which === KEYS.DELETE || key.which === BACKSPACE) {
            removeSup(st);
        }
    }

    if (!$('#text-data').is(':focus')) {
        // console.log('ZOOM: ', CURRENT_ZOOM, inputAreaFocus);
        if ((key.which === KEYS.EQUALS || key.which === 61) ){
            CURRENT_ZOOM = cy.zoom();
            if (key.shiftKey) { // zoom in
                CURRENT_ZOOM += 0.1;
            }  else {  // fit to screen
                CURRENT_ZOOM = cy.fit();
            }
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if ((key.which === KEYS.MINUS || key.which === 173) ) { // zoom out
            CURRENT_ZOOM = cy.zoom();
            //if (key.shiftKey) {
                CURRENT_ZOOM -= 0.1;
            //}
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if (key.which === 48 ) { // 0 = zoom 1.0
            CURRENT_ZOOM = 1.0;
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if (key.which == KEYS.P && !posInp.length && !wfInp.length && !deprelInp.length) {
						setPunct();
				}
    } else {
				if (key.which === KEYS.ENTER) {
						key.preventDefault();
						onEnterInTextarea();
				}
		}
		if ($('#table-data').has(':focus').length && key.which === KEYS.ENTER) {
				key.preventDefault();
				onEnterInTextarea();
		}
}

function onEnterInTextarea() {
		log.debug(`called onEnterInTextarea()`);

		let cursor = 999,
				text = $('#text-data').val(),
				format = detectFormat(text),
				linesBefore, linesAfter, updatedLines;

		if (IS_TABLE_VIEW) {

				// get the row number (id is of the form "table_ROW_COL")
				const row = parseInt($(':focus').prop('id').split('_')[1]) + 1;
				if (isNaN(row)) // something went wrong
						return;

				linesBefore = text.split('\n').slice(0, row);
				linesAfter = text.split('\n').slice(row);

		} else {

				cursor = $('#text-data').prop('selectionStart');
				while (text[cursor] !== '\n' && cursor < text.length)
						cursor++;

				linesBefore = text.slice(0, cursor).split('\n');
				linesAfter = text.slice(cursor+1).split('\n');

		}

		var id;
		switch (format) {
				case ('CoNLL-U'):

						id = parseInt(linesBefore[linesBefore.length - 1].split('\t')[0]);
						id = (isNaN(id) ? 1 : id + 1);

						updatedLines = [].concat(
								linesBefore,
								[`${id}\t_\t_\t_\t_\t_\t_\t_\t_\t_`],
								linesAfter.map((line) => {
										if (line.startsWith('#') || line === '')
												return line;

										let splitOnTabs = line.split('\t');
										splitOnTabs[0] = parseInt(splitOnTabs[0]) + 1; // incr index by 1

										return splitOnTabs.join('\t');
								}));

						$('#text-data').val(updatedLines.join('\n'))
								.prop('selectionStart', cursor)
								.prop('selectionEnd', cursor);
						viewAsConllu();
						break;

				case ('CG3'):

						function incrementIndices(line) {
								log.debug(`onEnterInTextarea(): before: ${line}`);
								if (line.startsWith('#') || line.startsWith('"<') || line === '')
										return line;

								const targets = line.match(/[#>][0-9]+/g);
								$.each(targets, (i, target) => {
										const targetId = parseInt(target.slice(1));
										if (!isNaN(targetId) && targetId > id)
												line = line.replace(target, `${target.slice(0,1)}${targetId + 1}`);
								});

								log.debug(`onEnterInTextarea(): after: ${line}`);
								return line;
						}

						id = linesBefore.reduce((acc,line) => {
								return acc + line.startsWith('"<');
						}, 0);

						updatedLines = [].concat(
								linesBefore.map(incrementIndices),
								['"<_>"'],
								[`\t${newCGAnalysis(id+1, {id:id+1})}`],
								linesAfter.map(incrementIndices));

						$('#text-data').val(updatedLines.join('\n'))
								.prop('selectionStart', cursor)
								.prop('selectionEnd', cursor);
						viewAsCG();
						break;

				default:
						text = text.slice(0,cursor) + '\n' + text.slice(cursor);
						$('#text-data').val(text);
		}

		updateTable();
}

function setPunct() {
		// courtesy of Daniel Swanson :)

		log.debug(`called setPunct(): PUNCTUATION TIME!`);

    // Commas and so forth should attach to dependent nodes in these relationships
    const commaEaters = ['acl', 'advcl', 'amod', 'appos', 'ccomp', 'obl'];
    // Paired punctuation that has different left and right forms
    const pairedPunctDiff = {'(':')', '[':']', '{':'}',  '“':'”', '„':'“', '«':'»', '‹':'›', '《':'》', '「':'」', '『':'』', '¿':'?',  '¡':'!'};
    // Paired punctuation where left and right are identical
    const pairedPunctSame = ["'", '"'];

    var sent = buildSent();
    var puncts = [];
    var bracketStack = [];
    var matches = [];
    var tok;
    var headList = [];
    var relList = [];
    var pairedPDLeft = Object.keys(pairedPunctDiff);
    var pairedPDRight = [];
    for (var i = 0; i < pairedPDLeft.length; i++) {
        pairedPDRight.push(pairedPunctDiff[pairedPDLeft[i]]);
    }
    var offsets = [];
    var idToIndex = {undefined:undefined, '0':-1};
    var subnodes = 0;
    var connect = function(src, dest, rel) {
        var sentAndPrev = changeConlluAttr(sent, [false, src, src], 'deprel', rel);
        sentAndPrev = changeConlluAttr(sent, [false, src, src], 'head', (parseInt(dest)+1+offsets[dest]).toString());
        headList[src] = dest;
        relList[src] = rel;
        sent = sentAndPrev[0];
    };
    var settok;
    var found;
    for (var i = 0; i < sent.tokens.length; i++) {
        tok = sent.tokens[i];
        offsets.push(subnodes);
        if (tok.hasOwnProperty('tokens')) {
            settok = 0;
            found = false;
            for (var j = 0; j < tok.tokens.length; j++) {
                idToIndex[tok.tokens[j].id] = i;
                if (!found && (tok.tokens[j].head < tok.tokens[0].id || tok.tokens[j].head > tok.tokens[tok.tokens.length-1].id)) {
                    offsets[i] += j;
                    settok = j;
                    found = true;
                }
            }
            subnodes += tok.tokens.length-1;
            tok = tok.tokens[settok];
        }
        headList.push(tok.head);
        idToIndex[tok.id] = i;
        relList.push(tok.deprel);
        if (tok.deprel == 'punct' && tok.upostag == undefined) {
            sentAndPrev = changeConlluAttr(sent, [false, i, i], 'upostag', 'PUNCT');
            sent = sentAndPrev[0];
            tok = sent.tokens[i];
        }
        if (tok.upostag == 'PUNCT') {
            if (pairedPDLeft.includes(tok.form)) {
                bracketStack.push([i, pairedPunctDiff[tok.form]]);
            } else if (pairedPDRight.includes(tok.form)) {
                if (bracketStack.length > 0 && bracketStack[bracketStack.length-1][1] == tok.form) {
                    matches.push([bracketStack.pop()[0], i]);
                } else {
                    puncts.push(i);
                }
            } else if (pairedPunctSame.includes(tok.form)) {
                if (bracketStack.length > 0 && bracketStack[bracketStack.length-1][1] == tok.form) {
                    matches.push([bracketStack.pop()[0], i]);
                } else {
                    bracketStack.push([i, tok.form]);
                }
            } else {
                puncts.push(i);
            }
        }
    }
    for (var i = 0; i < bracketStack.length; i++) {
        puncts.push(bracketStack[i][0]);
    }
    for (var i = 0; i < headList.length; i++) {
        headList[i] = idToIndex[headList[i]];
        if (headList[i] == undefined) {
            headList[i] = i;
            // pretend that unconnected nodes are pointing at themselves
            // rather than at nothing so we don't have pesky type-conversion issues
        }
    }
    var findBounds = function(idx) {
        var l = 0;
        var r = headList.length-1;
        for (var x = 0; x < headList.length-1; x++) {
            if ([undefined, 'x', 'root'].includes(relList[x])) {
                continue;
            } else if (x < idx && headList[x] > idx) {
                l = Math.max(x, l);
                r = Math.min(headList[x], r);
            } else if (x > idx && headList[x] < idx) {
                l = Math.max(headList[x], l);
                r = Math.min(x, r);
            }
        }
        return [l, r];
    };
    var findPossible = function(idx) {
        var ret = [];
        var bounds = findBounds(idx);
        var edge;
        for (var x = bounds[0]; x <= bounds[1]; x++) {
            if (x != idx && relList[x] != 'punct') {
                edge = findBounds(x);
                if (edge[0] <= idx && idx <= edge[1]) {
                    ret.push(x);
                }
            }
        }
        return ret;
    };
    var l;
    var r;
    var lpos;
    var rpos;
    var lpos2;
    var rpos2;
    var possible;
    var done;
    for (var i = 0; i < matches.length; i++) {
        l = matches[i][0];
        r = matches[i][1];
        lpos = findPossible(l);
        rpos = findPossible(r);
        possible = [];
        lpos2 = [];
        rpos2 = [];
        for (var j = 0; j < lpos.length; j++) {
            if (lpos[j] > l && lpos[j] < r) {
                if (rpos.includes(lpos[j])) {
                    possible.push(lpos[j]);
                }
                lpos2.push(lpos[j]);
            }
        }
        for (var j = 0; j < rpos.length; j++) {
            if (rpos[j] > l && rpos[j] < r) {
                rpos2.push(rpos[j]);
            }
        }
        if (possible.length > 0) {
            done = false;
            for (var j = 0; j < possible.length; j++) {
                if (headList[possible[j]] < l || headList[possible[j]] > r) {
                    connect(l, possible[j], 'punct');
                    connect(r, possible[j], 'punct');
                    done = true;
                    break;
                }
            }
            if (!done) {
                connect(l, possible[0], 'punct');
                connect(r, possible[0], 'punct');
            }
        } else {
            connect(l, lpos2[0], 'punct');
            connect(r, rpos2[rpos2.length-1], 'punct');
        }
    }
    for (var i = 0; i < puncts.length; i++) {
        possible = findPossible(puncts[i]);
        if (puncts[i] == headList.length-1 && possible.includes(relList.indexOf('root'))) {
            connect(puncts[i], relList.indexOf('root'), 'punct');
            continue;
        }
        if (relList[possible[possible.length-1]] == 'conj' && headList[possible[possible.length-1]] <= possible[0]) {
            connect(puncts[i], possible[possible.length-1], 'punct');
            continue;
        }
        possible.sort(function(a, b) {
            var ai = Math.abs(a - puncts[i]);
            var bi = Math.abs(b - puncts[i]);
            if (ai < bi || (ai == bi && a < b)) {
                return -1;
            } else if (bi > ai || (ai == bi && a > b)) {
                return 1;
            } else {
                return 0;
            }
        });
        done = false;
        for (var j = 0; j < possible.length; j++) {
            if (commaEaters.includes(relList[possible[j]])) {
                connect(puncts[i], possible[j], 'punct');
                done = true;
                break;
            }
        }
        if (!done) {
            for (var j = 0; j < possible.length; j++) {
                if (![undefined, 'x', 'root'].includes(relList[possible[j]])) {
                    connect(puncts[i], possible[j], 'punct');
                    done = true;
                    break;
                }
            }
        }
        if (!done && possible.length > 0) {
            connect(puncts[i], possible[0], 'punct');
        }
        if (!done) {
						log.debug(`setPunct(): couldn't find anything to attatch punctuation ${puncts[i]} to.`);
        }
    }

    redrawTree(sent);
}



function moveArc() {
		log.debug('called moveArc()');

    /* Activated after the key responsible for 'move dependent' key. */

		$('rect[data-span-id]').each( (i, node) => {
			node.unbind('click', clickWF);
			node.click(getArc);
		});
}


function removeSup(st) {
		log.debug(`called removeSup(${st.attr('id')})`);

    /* Support for removing supertokens.
    The function takes the cy-element of superoken that was selected,
    removes it and inserts its former subtokens. */

		let sent = buildSent(),
				currentId = parseInt(st.attr('id').slice(2)), // the id of the supertoken to be removed
				subTokens = sent.tokens[currentId].tokens;    // getting its children

		sent.tokens.splice(currentId, 1);		// removing the multiword token
		$.each(subTokens, (i, token) => {   // inserting the subtokens
			sent.tokens.splice(currentId + n, 0, token);
		});

    redrawTree(sent);
}


function changeNode() {
		log.debug(`called changeNode() (entries: ${Object.entries(this)}, id: ${this.attr('id')})`);

    IS_EDITING = true;

		this.addClass('input');
		const id = this.attr('id').slice(0, 2);
		let param = this.renderedBoundingBox(), nodeType;
		log.debug(`changeNode() (param: ${JSON.stringify(param)})`);

		param.color = this.style('background-color');
		if (id === 'ed') {
				param = changeEdgeParam(param);
				nodeType = 'DEPREL';
		} else if (id === 'np') {
				nodeType = 'UPOS';
		}

		// for some reason, there are problems with label in deprels without this
		if (this.data('label') === undefined)
				this.data('label', '');

		// to get rid of the magic direction arrows
		const res = this.data('label').replace(/[⊳⊲]/, '');
    this.data('label', res);

		$('#mute').addClass('activated');
		$('.activated#mute').css('height', (IS_VERTICAL
				? `${buildSent().tokens.length * 50}px`
				:	$(window).width() - 10) );

    // TODO: rank the labels + make the style better
    let availableLabels = [];
    if (nodeType === 'UPOS') {
        availableLabels = U_POS;
    } else if (nodeType === 'DEPREL') {
        availableLabels = U_DEPRELS;
    }
		log.debug(`changeNode() (availableLabels: ${availableLabels})`);


    // autocomplete

		$('#edit').selfcomplete({
				lookup: availableLabels,
				tabDisabled: false,
				autoSelectFirst: true,
				lookupLimit: 5
		});

    $('#edit')
				.css('top', param.y1)
        .css('left', param.x1)
        .css('height', param.h)
        .css('width', param.w + 35)
        //.css('background-color', param.color)
        .attr('value', this.data('label'))
        .addClass('activated')
        .addClass(id);

    if (nodeType === 'DEPREL') {
        $('#edit').focus().select();
    } else {
        $('#edit').focus();
    }

}


function changeEdgeParam(param) {
		log.debug(`called changeEdgeParam(${JSON.stringify(param)})`);

    param.w = 100;
    param.h = cy.nodes()[0].renderedHeight();

    if (IS_VERTICAL) {
        param.y1 = param.y1 + (param.y2 - param.y1)/2 - 15;
        param.x1 = param.x2 - 70;
    } else {
        param.x1 = param.x1 + (param.x2 - param.x1)/2 - 50;
    }

    param.color = 'white';
    return param;
}


function setRoot(wf) {
		log.debug(`called setRoot(id: ${wf.attr('id')})`);

		let sent = buildSent();
		const indices = findConlluId(wf),
				cur = parseInt(sent.tokens[indices.outer].id),
				head = 0;

		log.debug(`setRoot() (outerIndex: ${indices.outer}, cur: ${cur}, head: ${head})`);

		changeConlluAttr(sent, indices, 'deprel', 'root');
		changeConlluAttr(sent, indices, 'head', head);

		redrawTree(sent);
}



function writeDeprel(deprelInp, indices) { // TODO: DRY
		log.debug(`called writeDeprel(${deprelInp}, ${indices})`);

    /* Writes changes to deprel label. */

		if (indices === undefined) {
				const id = cy.$(`.input`).attr('id').slice(2),
						wfNode = cy.$(`#nf${id}`);
				indices = findConlluId(wfNode);
		}

		let sent = buildSent(),
				cur  = parseInt(sent.tokens[indices.outer].id);
				head = parseInt(sent.tokens[indices.outer].head);

		log.debug(`writeDeprel (head: ${head}, cur: ${cur})`);

		const sentAndPrev = changeConlluAttr(sent, indices, 'deprel', deprelInp);

		window.undoManager.add({
				undo: () => {
						const sent = buildSent(),
								sentAndPrev = changeConlluAttr(sent, indices, 'deprel', sentAndPrev.previous);
						redrawTree(sentAndPrev.sentence);
				},
				redo: () => {
						writeDeprel(deprelInp, indices);
				}
		});

    redrawTree(sentAndPrev.sentence);
}


function writePOS(posInp, indices) {
		log.debug(`called writePOS(posInp: ${posInp}, indices: ${JSON.stringify(indices)})`);

    /* Writes changes to POS label. */

    // getting indices
		if (indices === undefined) {
				const id = cy.$(`.input`).attr('id').slice(2),
						wfNode = cy.$(`#nf${id}`);
				indices = findConlluId(wfNode);
		}

		let sent = buildSent(),
				sentAndPrev = changeConlluAttr(sent, indices, 'upostag', posInp);

		window.undoManager.add({
				undo: () => {
						const sent = buildSent(),
								sentAndPrev = changeConlluAttr(sent, indices, 'upostag', sentAndPrev.previous);
						redrawTree(sentAndPrev.sentence);
				},
				redo: () => {
						writePOS(posInp, indices);
				}
		})

    redrawTree(sentAndPrev.sentence);

}


function changeConlluAttr(sent, indices, attrName, newVal) {
    log.debug('called changeConlluAttr()');

    //if (attrName === 'deprel') {
    //  newVal = newVal.replace(/[⊲⊳]/g, '');
    //}
    let previous;
    if (indices.isSubtoken) {
        previous = sent.tokens[indices.outer].tokens[indices.inner][attrName];
        sent.tokens[indices.outer].tokens[indices.inner][attrName] = newVal;
    } else {
        previous = sent.tokens[indices.outer][attrName];
        sent.tokens[indices.outer][attrName] = newVal;
    }

		return {
				sentence: sent,
				previous: previous
		};
}

function writeWF(wfInp) {
		log.debug(`called writeWF(${wfInp.val().trim()})`);

    /* Either writes changes to token or retokenises the sentence. */
    const newToken = wfInp.val().trim(),
				indices = findConlluId(cy.$('.input'));

		log.debug(`writeWF() (indices: ${JSON.stringify(indices)})`);

		let sent = buildSent();

    if (newToken.includes(' ')) { // this was a temporal solution. refactor.
        splitTokens(newToken, sent, indices);
    } else {
        if (indices.isSubtoken) {
            // TODO: think, whether it should be lemma or form.
            // sent.tokens[indices.outer].tokens[indices.inner].lemma = newToken;
            sent.tokens[indices.outer].tokens[indices.inner].form = newToken;
        } else {
            sent.tokens[indices.outer].form = newToken;
        }

        redrawTree(sent);
    }
}


function findConlluId(wf) { // TODO: refactor the architecture.
    log.debug(`called findConlluId(id: ${wf.attr('id')})`);

    // takes a cy wf node

    let isSubtoken = false, outerIndex = null, innerIndex = null;
    const parentIndex = cy.$(`#${wf.data('parent')}`).data('parent');

    if (parentIndex !== undefined) {
        isSubtoken = true;
        outerIndex = parseInt(parentIndex.slice(2));
        cy.$(`#${parentIndex}`).children().each((i, child) => {
            if (child.attr('id') === wf.attr('id'))
                innerIndex = i;
        });
    } else {
        const wfIndex = parseInt(wf.attr('id').slice(2));
        $.each(buildSent().tokens, (i, token) => {
            if (token.id === wfIndex)
                outerIndex = i;
        });
    }

		return {
				isSubtoken: isSubtoken,
				outer: outerIndex,
				inner: innerIndex
		};
}



function splitTokens(oldToken, sent, indices) {
		log.debug(`called splitTokens(oldToken: ${oldToken}, sent: ${JSON.stringify(sent)}, indices: ${JSON.stringify(indices)})`);

    /* Takes a token to retokenize with space in it and the Id of the token.
    Creates the new tokens, makes indices and head shifting, redraws the tree.
    All the attributes default to belong to the first part. */

		const newTokens = oldToken.split(' ');
		let token = sent.tokens[indices.outer];

		if (indices.isSubtoken) {

				sent.tokens[indices.outer].tokens[indices.inner].form = newTokens[0];
				// creating and inserting the second part
				const tokenId = sent.tokens[indices.outer].tokens[indices.inner].id;
				const restToken = formNewToken({ 'id':tokenId, 'form':newTokens[1] });
				sent.tokens[indices.outer].tokens.splice(indices.inner + 1, 0, restToken);

		} else {

				sent.tokens[indices.outer].form = newTokens[0];
				// creating and inserting the second part
				const tokenId = sent.tokens[indices.outer].id;
				const restToken = formNewToken({ 'id':tokenId, 'form':newTokens[1] });
				sent.tokens.splice(indices.outer + 1, 0, restToken);

		}


    $.each(sent.tokens, function(i, token) {
        if (token instanceof conllu.MultiwordToken) {
            $.each(token.tokens, function(j, subToken) {
                subToken = shiftIndices(subToken, i, indices, j);
            });
        } else if (token instanceof conllu.Token) {
            token = shiftIndices(token, i, indices);
        }
    });

    redrawTree(sent);
}


function shiftIndices(token, i, indices, j) {
		log.debug(`called shiftIndices(token:${token}, i:${i}, indices:${JSON.stringify(indices)}, j:${j}`);

    if (i > indices.outer || (indices.inner !== undefined && j > indices.inner))
        token.id += 1;

    if (token.head > indices.outer + 1)
        token.head = parseInt(token.head) + 1;

    return token;
}


function renumberNodes(nodeId, otherId, sent, side) {
		log.debug(`called renumberNodes(nodeId: ${nodeId}, otherId: ${otherId}, sent:${JSON.stringify(sent)}, side:${side})`);

    /* Shifts the node and head indices to the right. */
    $.each(sent.tokens, function(i, token) {

				if (    (side === 'right' && token.head > nodeId + 1)
						 || (side === 'left' && token.head > otherId))
						token.head = parseInt(token.head) - 1; // head correction

				if (    (side === 'right' && i > nodeId)
						 || (side === 'left' && i >= otherId))
						token.id -= 1; // id correction

    });

    return sent;
}


function mergeNodes(toMerge, side, how) {
		log.debug(`called mergeNodes(toMergeId: ${toMerge.attr('id')}, side: ${side}, how: ${how})`);

    /* Support for merging tokens into either a new token or a supertoken.
    Recieves the node to merge, side (right or left) and a string denoting
    how to merge the nodes. In case of success, redraws the tree. */

		const indices = findConlluId(toMerge);

		if (indices.isSubtoken) {
				const message = 'Sorry, merging subtokens is not supported!';
				log.warn(message);
				alert(message);
				drawTree();
				return;
		}

		const nodeId = indices.outer,
				otherId  = nodeId + (side === 'right' ? 1 : -1);

		let sent = buildSent();

		if (otherId >= 0 && sent.tokens[otherId]) {

				const main = toMerge.data('form'),
						other = sent.tokens[otherId].form,
						newToken = (side === 'right' ? main + other : other + main);

        if (how === 'subtoken') {

            sent.tokens[nodeId].form = newToken; // rewrite the token
            sent.tokens.splice(otherId, 1); // remove the merged token
            sent = renumberNodes(nodeId, otherId, sent, side);

        } else if (how === 'supertoken') {

            const min = Math.min(nodeId, otherId);
						let supertoken = new conllu.MultiwordToken();

            supertoken.tokens = sent.tokens.splice(min, 2);
            supertoken.form = newToken;
            sent.tokens.splice(min, 0, supertoken);

        };

        redrawTree(sent);

    } else {
				log.warn('mergeNodes() unable to merge: Probably wrong direction?');
    }
}


function buildSent() {
		log.debug(`called buildSent()`);

    /* Reads data from the textbox, returns a sent object. */
    let sent = new conllu.Sentence(),
				currentSent = $('#text-data').val(),
				currentFormat = detectFormat(currentSent);

    if (currentFormat === 'CG3') {
        currentSent = cg32Conllu(currentSent);
        if (currentSent === undefined) {
            drawTree();
            return;
        }
    }

    sent.serial = currentSent;
    return sent;
}


function redrawTree(sent) {
		log.debug(`called redrawTree(${JSON.stringify(sent)})`);

    // Takes a Sentence object. Writes it to the textbox and calls
    // the function drawing the tree and updating the table
    let changedSent = sent.serial;

    // detecting which format was used
		const currentSent = $('#text-data').val(),
				currentFormat = detectFormat(currentSent);

    if (currentFormat === 'CG3')
        changedSent = conllu2cg3(changedSent);

    $('#text-data').val(changedSent);
    updateTable();
    drawTree();
    cy.zoom(CURRENT_ZOOM);
}


// refactoring the write functions. in project, is not used yet
function writeSent(makeChanges) {
		log.debug(`called writeSent(${makeChanges.name.length ? makeChanges.name : '<anonymous>'})`);

    // build sent
    let sent = new conllu.Sentence();
    sent.serial = $('#text-data').val();

    sent = makeChanges(sent, this);

    // redraw tree
    $('#text-data').val(sent.serial);
    drawTree();
}


function viewAsPlain() { // TODO: DRY?
		log.debug(`called viewAsPlain()`);

    let text = $('#text-data').val(),
				currentFormat = detectFormat(text);

    if (currentFormat === 'CoNLL-U') {

        text = conllu2PlainText(text);

    } else if (currentFormat === 'CG3') {

        text = cg32Conllu(text);
        if (text === undefined) {
            cantConvertCG(); // show the error message
            return;
        } else {
            text = conllu2PlainText(text);
        }

    }

    $('#text-data').val(text);
}


function viewAsConllu() {
		log.debug(`called viewAsConllu()`);

    let curSent = $('#text-data').val(),
				currentFormat = detectFormat(curSent);

    if (currentFormat === 'CG3') {

        curSent = cg32Conllu(curSent);
        if (curSent === undefined) {
            cantConvertCG();
            return;
        }

        $('#tabCG3').removeClass('active');
        $('#tabConllu').addClass('active');
        $('#text-data').val(curSent);

    } else {

        let contents = getContents();
        if (currentFormat === 'plain text') {
            contents = txtCorpus2Conllu(contents);
            localStorage.setItem('corpus', contents);
            loadDataInIndex();
        } else if (currentFormat === 'SD') {
            // newContents = sd2Conllu(contents);
            sd2Conllu(contents); // TODO: make it like for txt
        }
        localStorage.setItem('format', 'CoNLL-U');

    }
}


function viewAsCG() {
		log.debug(`called viewAsCG()`);

    let text = $('#text-data').val(),
				currentFormat = detectFormat(text);

    if (currentFormat === 'CoNLL-U') {
        text = conllu2cg3(text);
        $('#tabConllu').removeClass('active');
    }

    $('#tabCG3').addClass('active');
    $('#text-data').val(text);

    if (IS_TABLE_VIEW) {
        $('#btnViewTable i').toggleClass('fa-code', 'fa-table');
        $('#table-data').toggle();
        $('#text-data').toggle();
        IS_TABLE_VIEW = false ;
    }

}


function cantConvertCG() {
		const message = 'Warning: CG containing ambiguous analyses can\'t be converted into CoNLL-U!';
		log.warn(message);

		$('#tabConllu').prop('disabled', true);
    $('#warning').css('background-color', 'pink')
        .text(message);
}


function clearWarning() {
		log.debug('called clearWarning()');

		$('#tabConllu').prop('disabled', false);
    $('#warning').css('background-color', 'white')
        .text('');
}


function focusOut(key) {
		log.debug(`called focusOut(${key.which})`);

    if (key.which === KEYS.ESC) {
        this.blur();
    }
}


function switchRtlMode() {
		log.debug(`called switchRtlMode()`);

		$('#RTL .fa').toggleClass('fa-align-right');
		$('#RTL .fa').toggleClass('fa-align-left');
		IS_LTR = !IS_LTR;

	  drawTree();
}


function switchAlignment() {
		log.debug(`called switchAlignment()`);

		$('#vertical .fa').toggleClass('fa-rotate-90');
		IS_VERTICAL = !IS_VERTICAL;

		drawTree();
}

function switchEnhanced() {
		log.debug(`called switchEnhanced()`);

	  $('#enhanced .fa').toggleClass('fa-tree');
	  $('#enhanced .fa').toggleClass('fa-magic');
		IS_ENHANCED = !IS_ENHANCED;

		drawTree();
}


$(document).ready(function(){
		$('#inputCurrSentence').keyup((e) => {
				if (e.keyCode === 13) {
						goToSenSent();
				} else if (e.keyCode === KEYS.UP || e.keyCode === KEYS.K) {
						prevSenSent();
				} else if (e.keyCode === KEYS.DOWN || e.keyCode === KEYS.J) {
						nextSenSent();
				} else if (e.keyCode === KEYS.MINUS) {
						removeCurSent();
				} else if (e.keyCode === KEYS.EQUALS) {
						addSent();
				}
		});

		// solution based on https://stackoverflow.com/a/12444641/5181692
		let map = [];
		onkeydown = onkeyup = (e) => {
				e = e || event; // to deal with IE
				map[e.key] = e.type === 'keydown';
				/* insert conditional here */
				if (map['Shift'] && map['PageDown']) {
						nextSenSent();
						map = [];
						map['Shift'] = true; // leave Shift so that another event can be fired
				} else if (map['Shift'] && map['PageUp']) {
						prevSenSent();
						map = [];
						map['Shift'] = true; // leave Shift so that another event can be fired
				} else if (map['Control'] && map['z']) {
						undoManager.undo();
						updateUI();
				} else if (map['Control'] && map['y'] || map['Control'] && map['Shift'] && map['Z']) {
						undoManager.redo();
						updateUI();
				}
				//return false;  // only needed if want to override all the shortcuts
		}

		$('#helpModal').on('shown.bs.modal', (e) => {
        // $('#treebankSize').text(CONTENTS.length); // TODO: Report the current loaded treebank size to user
				$(e.target).find('.modal-body').load('help.html');
		});

    $('#exportModal').on('shown.bs.modal', (e) => {
				// $('#treebankSize').text(CONTENTS.length); // TODO: Report the current loaded treebank size to user
				$(e.target).find('.modal-body').load('export.html', exportPNG);
		});

    $('#exportModal').on('hidden.bs.modal', (e) => {
        IS_PNG_EXPORTED = false;
        IS_LATEX_EXPORTED = false;
    });

		/*
		$('.ui-autocomplete').keydown(function(e) {
				if (e.keyCode === 9) // Tab
						console.log('test');
		});
		*/

		$('#viewText').hide();

		// collapse columns when header is clicked on
		$('.thead-default th').on('click', (e) => {
				const columnHeader = $('.tableColHeader', this)[0];
				if (columnHeader)  // prevents non-collapsible cols from throwing errors
						toggleTableColumn(columnHeader.title);
		});
});
