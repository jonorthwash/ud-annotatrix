'use strict'

/*
This scripts contains makes support for graphical editing.
*/

var DEL_KEY = 46;
var BACKSPACE = 8;
var ENTER = 13;
var ESC = 27;
var TAB = 9;
var RIGHT = 39;
var LEFT = 37;
var CURRENT_ZOOM = 1.0;
var UP = 38;
var DOWN = 40;
var MINUS = 189;
var EQUALS = 187; // also PLUS
var J = 74;
var K = 75;
var D = 68;
var I = 73;
var S = 83;
var R = 82;
var M = 77;
var SIDES = {39: 'right', 37: 'left'};
var ISEDITING = false;
var POS2RELmappings = {
	'PUNCT': 'punct',
	'DET': 'det',
	'CCONJ': 'cc',
	'SCONJ': 'mark'
}


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

    const indices = findConlluId2(target);

    let sent = buildSent(),
        thisToken = sent.tokens[indices.outerIndex],
        sentAndPrev = changeConlluAttr2(sent, indices, 'head', sourceIndex);

    // If the target POS tag is PUNCT set the deprel to @punct [99%]
    // IF the target POS tag is CCONJ set the deprel to @cc [88%]
    // IF the target POS tag is SCONJ set the deprel to @mark [86%]
    // IF the target POS tag is DET set the deprel to @det [83%]
    // TODO: Put this somewhere better
    if (thisToken.upostag in POS2RELmappings)
        sentAndPrev = changeConlluAttr2(sent, indices, 'deprel', POS2RELmappings[thisToken.upostag]);

    let isValidDep = true;
    if (thisToken.upostag === 'PUNCT' && !is_projective_nodes(sent.tokens, [targetIndex])) {
        log.warn('writeArc(): Non-projective punctuation');
        isValidDep = false
    }

    window.undoManager.add({
        undo: () => {
            let sent = buildSent(),
                sentAndPrev = changeConlluAttr2(sent, indices, 'head', sentAndPrev.previous);
            redrawTree(sentAndPrev.sent);
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
            indices = findConlluId2(target);

        let sentAndPrev = changeConlluAttr2(sent, indices, 'head', undefined);

        sent = sentAndPrev.sent;
        prevRelations.head = sentAndPrev.previous;
        sentAndPrev = changeConlluAttr2(sent, indices, 'deprel', undefined);
        sent = sentAndPrev.sent;
        prevRelations.deprel = sentAndPrev.previous;

    });

    window.undoManager.add({
        undo: () => {
            let sent = buildSent();
            $.each(targetNodes, (i, target) => {
                const targetIndex = target.attr('id').slice(2),
                    indices = findConlluId2(target);

                let sentAndPrev = changeConlluAttr2(sent, indices, 'head', prevRelations.head);
                sent = sentAndPrev.sent;
                sentAndPrev = changeConlluAttr2(sent, indices, 'deprel', prevRelations.deprel);
                sent = sentAndPrev.sent;
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

    if(!ISEDITING) {

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
    //     if (key.which === ESC) {
    //         e.preventDefault();
    //         drawTree();
    //     }
    // });

    if (key.which === ESC) {
        key.preventDefault();
        drawTree();
    }

    if ($('#edit').is(':focus')) {
        if (key.which === TAB) {
            key.preventDefault();
        }
    }

    if (selArcs.length) {
        if (key.which === DEL_KEY || key.which === BACKSPACE) {
            removeArc(targetNodes);
        } else if (key.which === D) {
            moveArc();
        };
    } else if (posInp.length) {
        if (key.which === ENTER) {
            writePOS(posInp.val());
        };
    } else if (wfInp.length) {
        if (key.which === ENTER) {
            writeWF(wfInp);
        };
    } else if (deprelInp.length) {
        if (key.which === ENTER) {
            var res = deprelInp.val();
            // to get rid of the magic direction arrows
            res = res.replace(/[⊳⊲]/, '');
            writeDeprel(res);
        };
    } else if (wf.length === 1) {
        if (key.which === M) {
            wf.addClass('merge');
            wf.removeClass('activated');
        } else if (key.which === S) {
            wf.addClass('supertoken');
            wf.removeClass('activated');
        } else if (key.which === R) {
            setRoot(wf);
        };
    } else if (toMerge.length) {
        if (key.which in SIDES) {
            mergeNodes(toMerge, SIDES[key.which], 'subtoken');
        }
    } else if (toSup.length) {
        if (key.which in SIDES) {
            mergeNodes(toSup, SIDES[key.which], 'supertoken');
        }
    } else if (st.length) {
        if (key.which === DEL_KEY || key.which === BACKSPACE) {
            removeSup(st);
        }
    }

    if(!$('#indata').is(':focus')) {
        // console.log('ZOOM: ', CURRENT_ZOOM, inputAreaFocus);
        if((key.which === EQUALS || key.which === 61) ){
            CURRENT_ZOOM = cy.zoom();
            if (key.shiftKey) { // zoom in
                CURRENT_ZOOM += 0.1;
            }  else {  // fit to screen
                CURRENT_ZOOM = cy.fit();
            }
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if((key.which === MINUS || key.which === 173) ) { // zoom out
            CURRENT_ZOOM = cy.zoom();
            //if(key.shiftKey) {
                CURRENT_ZOOM -= 0.1;
            //}
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if(key.which === 48 ) { // 0 = zoom 1.0
            CURRENT_ZOOM = 1.0;
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        }
    }
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
//    cy.on('zoom', cy.center); // center the view port when the page zoom is changed
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

    ISEDITING = true;

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
		$('.activated#mute').css('height', (VERT_ALIGNMENT
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

    if (VERT_ALIGNMENT) {
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
		const indices = findConlluId2(wf),
				cur = parseInt(sent.tokens[ indices.outerIndex ].id),
				head = 0;

		log.debug(`setRoot() (outerIndex: ${indices.outerIndex}, cur: ${cur}, head: ${head})`);

		changeConlluAttr2(sent, indices, 'deprel', 'root');
		changeConlluAttr2(sent, indices, 'head', head);

		redrawTree(sent);
}



function writeDeprel(deprelInp, indices) { // TODO: DRY
		log.debug(`called writeDeprel(${deprelInp}, ${indices})`);

    /* Writes changes to deprel label. */

		if (indices === undefined) {
				const id = cy.$(`.input`).attr('id').slice(2),
						wfNode = cy.$(`#nf${id}`);
				indices = findConlluId2(wfNode);
		}

		let sent = buildSent(),
				cur  = parseInt(sent.tokens[ indices.outerIndex ].id);
				head = parseInt(sent.tokens[ indices.outerIndex ].head);

		log.debug(`writeDeprel (head: ${head}, cur: ${cur})`);

		const sentAndPrev = changeConlluAttr2(sent, indices, 'deprel', deprelInp);

		window.undoManager.add({
				undo: () => {
						const sent = buildSent(),
								sentAndPrev = changeConlluAttr2(sent, indices, 'deprel', sentAndPrev.previous);
						redrawTree(sentAndPrev.sent);
				},
				redo: () => {
						writeDeprel(deprelInp, indices);
				}
		});

    redrawTree(sentAndPrev.sent);
}


function writePOS(posInp, indices) {
		log.debug(`called writePOS(posInp: ${posInp}, indices: ${JSON.stringify(indices)})`);

    /* Writes changes to POS label. */

    // getting indices
		if (indices === undefined) {
				const id = cy.$(`.input`).attr('id').slice(2),
						wfNode = cy.$(`#nf${id}`);
				indices = findConlluId2(wfNode);
		}

		let sent = buildSent(),
				sentAndPrev = changeConlluAttr2(sent, indices, 'upostag', posInp);

		window.undoManager.add({
				undo: () => {
						const sent = buildSent(),
								sentAndPrev = changeConlluAttr2(sent, indices, 'upostag', sentAndPrev.previous);
						redrawTree(sentAndPrev.sent);
				},
				redo: () => {
						writePOS(posInp, indices);
				}
		})

    redrawTree(sentAndPrev.sent);

}


function changeConlluAttr2(sent, indices, attrName, newVal) {
    const arr = changeConlluAttr(sent, indices, attrName, newVal);
    const ret = { sent:arr[0], previous:arr[1] };

    log.debug(`changeConlluAttr() returned: ${JSON.stringify(ret)}`);
    return ret;
}
function changeConlluAttr(sent, indices, attrName, newVal) {
    log.debug('called changeConlluAttr()');
		console.log(indices);
    //if(attrName === 'deprel') {
    //  newVal = newVal.replace(/[⊲⊳]/g, '');
    //}
    let previous;
    if (indices.isSubtoken) {
        previous = sent.tokens[ indices.outerIndex ].tokens[ indices.innerIndex ][attrName];
        sent.tokens[ indices.outerIndex ].tokens[ indices.innerIndex ][attrName] = newVal;
    } else {
        previous = sent.tokens[ indices.outerIndex ][attrName];
        sent.tokens[ indices.outerIndex ][attrName] = newVal;
    }
    return [sent, previous];
}

function writeWF(wfInp) {
		log.debug(`called writeWF(${wfInp.val().trim()})`);

    /* Either writes changes to token or retokenises the sentence. */
    const newToken = wfInp.val().trim(),
				indices = findConlluId2(cy.$('.input'));

		log.debug(`writeWF() (indices: ${JSON.stringify(indices)})`);

		let sent = buildSent();

    if (newToken.includes(' ')) { // this was a temporal solution. refactor.
        splitTokens(newToken, sent, indices);
    } else {
        if (indices.isSubtoken) {
            // TODO: think, whether it should be lemma or form.
            // sent.tokens[outerIndex].tokens[innerIndex].lemma = newToken;
            sent.tokens[indices.outerIndex].tokens[indices.innerIndex].form = newToken;
        } else {
            sent.tokens[indices.outerIndex].form = newToken;
        }

        redrawTree(sent);
    }
}


function findConlluId2(wf) {
    const arr = findConlluId(wf);
    const ret = { isSubtoken:arr[0], outerIndex:arr[1], innerIndex:arr[2] };

    log.debug(`findConlluId() returned: ${JSON.stringify(ret)}`);
    return ret;
}

function findConlluId(wf) { // TODO: refactor the arcitecture.
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

    return [isSubtoken, outerIndex, innerIndex];
}



function splitTokens(oldToken, sent, indices) {
		log.debug(`called splitTokens(oldToken: ${oldToken}, sent: ${JSON.stringify(sent)}, indices: ${JSON.stringify(indices)})`);

    /* Takes a token to retokenize with space in it and the Id of the token.
    Creates the new tokens, makes indices and head shifting, redraws the tree.
    All the attributes default to belong to the first part. */

		const newTokens = oldToken.split(' ');
		let token = sent.tokens[indices.outerIndex];

		if (indices.isSubtoken) {

				sent.tokens[indices.outerIndex].tokens[indices.innerIndex].form = newTokens[0];
				// creating and inserting the second part
				const tokenId = sent.tokens[indices.outerIndex].tokens[indices.innerIndex].id;
				const restToken = formNewToken({ 'id':tokenId, 'form':newTokens[1] });
				sent.tokens[indices.outerIndex].tokens.splice(indices.innerIndex + 1, 0, restToken);

		} else {

				sent.tokens[indices.outerIndex].form = newTokens[0];
				// creating and inserting the second part
				const tokenId = sent.tokens[indices.outerIndex].id;
				const restToken = formNewToken({ 'id':tokenId, 'form':newTokens[1] });
				sent.tokens.splice(indices.outerIndex + 1, 0, restToken);

		}


    $.each(sent.tokens, function(i, token) {
        if (token instanceof conllu.MultiwordToken) {
            $.each(token.tokens, function(j, subToken) {
                subToken = shiftIndices(subToken, i, indices.outerIndex, indices.innerIndex, j);
            });
        } else if (token instanceof conllu.Token) {
            token = shiftIndices(token, i, indices.outerIndex);
        }
    });

    redrawTree(sent);
}


function shiftIndices(token, i, outerIndex, innerIndex, j) {
		log.debug(`called shiftIndices(token:${token}, i:${i}, outerIndex:${outerIndex}, innerIndex:${innerIndex})`);

    if (i > outerIndex || (innerIndex !== undefined && j > innerIndex))
        token.id += 1;

    if (token.head > outerIndex + 1)
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

		const indices = findConlluId2(toMerge);

		if (indices.isSubtoken) {
				const message = 'Sorry, merging subtokens is not supported!';
				log.warn(message);
				alert(message);
				drawTree();
				return;
		}

		const nodeId = indices.outerIndex,
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
				currentSent = $('#indata').val(),
				currentFormat = detectFormat(currentSent);

    if (currentFormat === 'CG3') {
        currentSent = CG2conllu(currentSent);
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
		const currentSent = $('#indata').val(),
				currentFormat = detectFormat(currentSent);

    if (currentFormat === 'CG3')
        changedSent = conllu2CG(changedSent);

    $('#indata').val(changedSent);
    updateTable();
    drawTree();
    cy.zoom(CURRENT_ZOOM);
}


// refactoring the write functions. in project, is not used yet
function writeSent(makeChanges) {
		log.debug(`called writeSent(${makeChanges.name.length ? makeChanges.name : '<anonymous>'})`);

    // build sent
    let sent = new conllu.Sentence();
    sent.serial = $('#indata').val();

    sent = makeChanges(sent, this);

    // redraw tree
    $('#indata').val(sent.serial);
    drawTree();
}


function viewAsPlain() { // TODO: DRY?
		log.debug(`called viewAsPlain()`);

    let text = $('#indata').val(),
				currentFormat = detectFormat(text);

    if (currentFormat === 'CoNLL-U') {

        text = conllu2plainSent(text);

    } else if (currentFormat === 'CG3') {

        text = CG2conllu(text);
        if (text === undefined) {
            cantConvertCG(); // show the error message
            return;
        } else {
            text = conllu2plainSent(text);
        }

    }

    $('#indata').val(text);
}


function viewAsConllu() {
		log.debug(`called viewAsConllu()`);

    let curSent = $('#indata').val(),
				currentFormat = detectFormat(curSent);

    if (currentFormat === 'CG3') {

        curSent = CG2conllu(curSent);
        if (curSent === undefined) {
            cantConvertCG();
            return;
        }

        $('#viewCG').removeClass('active');
        $('#viewConllu').addClass('active');
        $('#indata').val(curSent);

    } else {

        let contents = getContents();
        if (currentFormat === 'plain text') {
            contents = txtCorpus2Conllu(contents);
            localStorage.setItem('corpus', contents);
            loadDataInIndex();
        } else if (currentFormat === 'SD') {
            // newContents = SD2Conllu(contents);
            SD2Conllu(contents); // TODO: make it like for txt
        }
        localStorage.setItem('format', 'CoNLL-U');

    }
}


function viewAsCG() {
		log.debug(`called viewAsCG()`);

    let text = $('#indata').val(),
				currentFormat = detectFormat(text);

    if (currentFormat === 'CoNLL-U') {
        text = conllu2CG(text);
        $('#viewConllu').removeClass('active');
    }

    $('#viewCG').addClass('active');
    $('#indata').val(text);

    if (TABLE_VIEW) {
        $('#tableViewButton').toggleClass('fa-code', 'fa-table');
        $('#indataTable').toggle();
        $('#indata').toggle();
        TABLE_VIEW = false ;
    }

}


function cantConvertCG() {
		const message = 'Warning: CG containing ambiguous analyses can\'t be converted into CoNLL-U!';
		log.warn(message);

		$('#viewConllu').prop('disabled', true);
    $('#warning').css('background-color', 'pink')
        .text(message);
}


function clearWarning() {
		log.debug('called clearWarning()');

		$('#viewConllu').prop('disabled', false);
    $('#warning').css('background-color', 'white')
        .text('');
}


function focusOut(key) {
		log.debug(`called focusOut(${key.which})`);

    if (key.which === ESC) {
        this.blur();
    }
}


function switchRtlMode() {
		log.debug(`called switchRtlMode()`);

		$('#RTL .fa').toggleClass('fa-align-right');
		$('#RTL .fa').toggleClass('fa-align-left');
		LEFT_TO_RIGHT = !LEFT_TO_RIGHT;

	  drawTree();
}


function switchAlignment() {
		log.debug(`called switchAlignment()`);

		$('#vertical .fa').toggleClass('fa-rotate-90');
		VERT_ALIGNMENT = !VERT_ALIGNMENT;

		drawTree();
}

function switchEnhanced() {
		log.debug(`called switchEnhanced()`);

	  $('#enhanced .fa').toggleClass('fa-tree');
	  $('#enhanced .fa').toggleClass('fa-magic');
		VIEW_ENHANCED = !VIEW_ENHANCED;

		drawTree();
}


$(document).ready(function(){
		$('#currentsen').keyup((e) => {
				if (e.keyCode === 13) {
						goToSentence();
				} else if (e.keyCode === UP || e.keyCode === K) {
						prevSentence();
				} else if (e.keyCode === DOWN || e.keyCode === J) {
						nextSentence();
				} else if (e.keyCode === MINUS) {
						removeCurSent();
				} else if (e.keyCode === EQUALS) {
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
						nextSentence();
						map = [];
						map['Shift'] = true; // leave Shift so that another event can be fired
				} else if (map['Shift'] && map['PageUp']) {
						prevSentence();
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
				// $("#treebankSize").text(CONTENTS.length); // TODO: Report the current loaded treebank size to user
				$(e.target).find('.modal-body').load('export.html', exportPNG);
		});

    $('#exportModal').on('hidden.bs.modal', (e) => {
        png_exported = false;
        latex_exported = false;
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
