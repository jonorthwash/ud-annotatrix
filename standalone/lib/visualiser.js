"use strict"

var VERT_ALIGNMENT = false;
var LEFT_TO_RIGHT = true;
var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";
var POS_COLOR = "#afa2ff";
var ST_COLOR = "#bcd2ff"
var SCROLL_ZOOM_INCREMENT = 0.05;
var TREE_ = {}; // This map allows us to address the Token object given an ID
var VIEW_ENHANCED = false;

// Used for calculating progress
var ALL_WORK = 0
var DONE_WORK = 0

var edgeHeight = 40;
var defaultCoef = 1; // 0.7
var staggersize = 15;


// require lib for CoNLL-U parsing
var conllu = require("conllu");

var codeLateX = '';
var png_exported = false;
var latex_exported = false;

function measureText(text) {
    // actual canvas not created yet
    var context = document.createElement("canvas").getContext("2d");
    context.font = "1rem sans-serif";

    text = text || "#"; // width for empty string
    text = "." + text + "."; // minor padding
    return context.measureText(text).width + "px";
}

/**
 * Draws the tree.
 * @param {String} content Content of the input textbox.
 */
function conlluDraw(content) {
    var sent = new conllu.Sentence();
    sent.serial = content;
    changeBoxSize(sent);
    changeEdgeStyle();
    var layout = formLayout(); // This is the thing that lays out nodes on the grid

    var cy = window.cy = cytoscape({
        container: document.getElementById("cy"),

        boxSelectionEnabled: false,
        autounselectify: true,
        autoungrabify: true,
        zoomingEnabled: true,
        userZoomingEnabled: false,
        wheelSensitivity: 0.1,
        layout: layout,
        style: CY_STYLE,
        elements: conllu2cy(sent)
    });

//    if(content.split('\n').length > 10) {
//          if(!VIEW_ENHANCED){
              cleanEdges();
//          }
//    }

    cy.minZoom(0.1);
    cy.maxZoom(10.0);

    // Fit the graph to the window size
    CURRENT_ZOOM = cy.zoom(); // Get the current zoom factor.
    // console.log('[0] CURRENT_ZOOM:', CURRENT_ZOOM);
    cy.fit();
    // console.log('[1] CURRENT_ZOOM:', CURRENT_ZOOM);
    CURRENT_ZOOM = cy.zoom(); // Get the current zoom factor.
    // console.log('[2] CURRENT_ZOOM:', CURRENT_ZOOM);
    if(CURRENT_ZOOM >= 1.7) { // If the current zoom factor is more than 1.7, then set it to 1.7
      CURRENT_ZOOM = 1.7;           // This is to make sure that small trees don't appear massive.
    } else if (CURRENT_ZOOM <= 0.7) {
      CURRENT_ZOOM = 0.7;
    }
    // console.log('[3] CURRENT_ZOOM:', CURRENT_ZOOM);
    cy.zoom(CURRENT_ZOOM);
    // console.log('[4] CURRENT_ZOOM:', CURRENT_ZOOM);
    cy.center();
    $(window).bind('resize', onResize);
    $(window).bind('DOMMouseScroll wheel', onScroll);
}

/**
 * Resizes the visualiser window.
 * @param {Object} e Event.
 */
function onResize(e) {
    CURRENT_ZOOM = cy.zoom(); // Get the current zoom factor.
    console.log('< resize event', CURRENT_ZOOM, cy.width(), cy.height());
    console.log('[6] CURRENT_ZOOM:', CURRENT_ZOOM);
    cy.fit();
    cy.resize();
    cy.reset();

    CURRENT_ZOOM = cy.zoom(); // Get the current zoom factor.
//    cy.center();
//    CURRENT_ZOOM = cy.zoom();
    console.log('[7] CURRENT_ZOOM:', CURRENT_ZOOM);
    console.log('> resize event', CURRENT_ZOOM, cy.width(), cy.height());

    if(!VERT_ALIGNMENT) {
        $("#cy").css("height", $(window).height()-$(".inarea").height()-80);
    }
}

/**
 * Detects if the user is shift-scrolling and zooms.
 * @param  {Object}  event  Key Event.
 * @return {Boolean}        False.
 */
function onScroll(event) {
    if(event.shiftKey) {
      // console.log('SHIFT SCROLL', event.shiftKey, event.originalEvent.wheelDelta, event.originalEvent.detail, event.originalEvent.deltaY);
      if(event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0 || event.originalEvent.deltaY < 0) { // up
          //console.log('SHIFT SCROLL', event.shiftKey, 'UP', CURRENT_ZOOM);
          CURRENT_ZOOM += SCROLL_ZOOM_INCREMENT;
          cy.zoom(CURRENT_ZOOM);
          cy.center();
      } else { //down
          //console.log('SHIFT SCROLL', event.shiftKey, 'DOWN', CURRENT_ZOOM);
          CURRENT_ZOOM -= SCROLL_ZOOM_INCREMENT;
          cy.zoom(CURRENT_ZOOM);
          cy.center();
      }
      return false;
    }

    //} else {
    //  console.log('SCROLL', event.shiftKey);
    //  return;
}

/**
 * Changes the size of the cytoscape viewport.
 * @param {Object} sent A conllu.Sentence().
 */
function changeBoxSize(sent) {
    var length = sent.tokens.length;
    if (VERT_ALIGNMENT) {
        //$("#cy").css("width", "1500px");
        $("#cy").css("width", $(window).width()-10);
        $("#cy").css("height", (length * 50) + "px");
    } else {
        // scales width according to viewport
        $("#cy").css("width", "100%");
        // window height - height of top area - height of controls
        $("#cy").css("height", $(window).height()-$(".inarea").height()-80);
    }
}

/**
 * Layout nodes on a grid, condense means.
 * @return {Object} A tree containing formatting.
 */
function formLayout() {
    var layout = {name: "tree",
                    padding: 0,
                    nodeDimensionsIncludeLabels: false
    };
    if (VERT_ALIGNMENT) {
        layout.cols = 2;
        layout.sort = vertAlSort;
    } else {
        layout.rows = 2;
        if (LEFT_TO_RIGHT) {
            layout.sort = simpleIdSorting;
        } else {
            layout.sort = rtlSorting;
        }
    }
    return layout;
}

/**
 * Changes the edge style based on alignment.
 */
function changeEdgeStyle() {
    var depEdgeStyle = CY_STYLE[12]["style"];
    if (VERT_ALIGNMENT) {
        depEdgeStyle["text-margin-y"] = 0;
        depEdgeStyle["text-background-opacity"] = 1;
        depEdgeStyle["text-background-color"] = "white";
        depEdgeStyle["text-background-shape"] = "roundrectangle";
        depEdgeStyle["text-border-color"] = "black";
        depEdgeStyle["text-border-width"] = 1;
        depEdgeStyle["text-border-opacity"] = 1;
        depEdgeStyle["control-point-weights"] = "0.15 0.45 0.55 0.85";
        depEdgeStyle["text-margin-x"] = "data(length)";
        depEdgeStyle["source-distance-from-node"] = 10;
        depEdgeStyle["target-distance-from-node"] = 10;
    } else {
        depEdgeStyle["text-margin-y"] = -10;
        depEdgeStyle["text-margin-x"] = 0;
        depEdgeStyle["text-background-opacity"] = 0;
        depEdgeStyle["text-border-opacity"] = 0;
        depEdgeStyle["control-point-weights"] = "0 0.25 0.75 1";
        depEdgeStyle["source-distance-from-node"] = 0;
        depEdgeStyle["target-distance-from-node"] = 0;
    }
}

function showProgress() {
    var progressPercentage = DONE_WORK/(ALL_WORK-1)*100;
    $('#progressBar').animate({
        width: progressPercentage + '%'
    });
}

/**
 * Creates a graph out of the conllu.Sentence().
 * @param  {Object} sent A conllu.Sentence().
 * @return {Array}       Returns the graph.
 */
function conllu2cy(sent) {
    var graph = [];
    TREE_ = {};
    $.each(sent.tokens, function(n, token) {
        if (token instanceof conllu.MultiwordToken){
            // ns = supertoken
            var spId = "ns" + strWithZero(n);
            var id = toSubscript(" (" + findSupTokId(token.tokens) + ")");
            var MultiwordToken = {
                "data": {"id": spId,"label": token.form + id},
                "classes": "MultiwordToken"
            };
            graph.push(MultiwordToken);
            $.each(token.tokens, function(n, subTok) {
                graph = createToken(graph, subTok, spId);
            });

        } else {
            graph = createToken(graph, token);
        }
    })

    if(VIEW_ENHANCED) {
    $.each(sent.tokens, function(n, token) {
        console.log('VIEW_ENHANCED');
        var enhancedDepsCol = token.deps.split('|');
        for(var i = 0; i < enhancedDepsCol.length; i++) {
            var enhancedRow = enhancedDepsCol[i].split(':');
            var enhancedHead = parseInt(enhancedRow[0]);
            var enhancedDeprel = enhancedRow.slice(1).join();
    var nodeId = token.id;
            graph = makeEnhancedDependency(token, nodeId, enhancedHead, enhancedDeprel, graph);
        }
    })
    }

    ALL_WORK = 0;
    DONE_WORK = 0;
    for(var i = 0; i < graph.length; i++) {
        if(graph[i].classes == 'wf') {
            ALL_WORK += 2;
            if(graph[i].data.head != undefined) {
                DONE_WORK += 1;
            }
            if(graph[i].data.upostag != undefined) {
                DONE_WORK += 1;
            }
        } else if(graph[i].classes.indexOf('dependency') != -1) {
            ALL_WORK++;
            if(graph[i].classes != 'dependency incomplete') {
                DONE_WORK++;
            }
        }
    }
    codeLateX = generateLateX(graph);

    return graph;
}

function exportSVG() {
    $('#exportModal').find('#exportedGraph').css('display', 'none');
    $('#exportModal').find('#latexExportError').css('display', 'none');
    $('#exportModal').find('#exportLATEX-textarea').css('display', 'none');

    var ctx = new C2S(cy.width, cy.height);
    cy.renderer().renderTo(ctx);
    var ctxSerializedSVG = ctx.getSerializedSvg();
    
    $('#exportModal').find('#svgResult').attr('src', 'data:image/svg+xml;charset=utf-8,'+ctxSerializedSVG);

    $('#exportModal').find('#svgResult').css('display', 'inline');
}

function exportPNG() {
    $('#exportModal').find('#svgResult').css('display', 'none');
    $('#exportModal').find('#latexExportError').css('display', 'none');
    $('#exportModal').find('#exportLATEX-textarea').css('display', 'none');

    var b64key = 'base64,';
    var b64 = cy.png().substring( cy.png().indexOf(b64key) + b64key.length);
    var imgBlob = b64toBlob(b64, 'image/png');

    $('#exportModal').find('#exportedGraph').attr('src', URL.createObjectURL(imgBlob));
    $('#exportModal').find('#exportedGraph').css('width', '100%');

    $('#exportModal').find('#exportedGraph').css('display', 'inline');
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}


function exportLATEX() {
    $('#exportModal').find('#exportLATEX-textarea').val('');

    $('#exportModal').find('#exportLATEX-textarea').css('display', 'none');
    $('#exportModal').find('#svgResult').css('display', 'none');
    $('#exportModal').find('#latexExportError').css('display', 'none');
    $('#exportModal').find('#exportedGraph').css('display', 'none');

    if(codeLateX == 'error') {
        $('#exportModal').find('#latexExportError').css('display', 'inline');
    } else {
        $('#exportModal').find('#exportLATEX-textarea').val(codeLateX.join('\n'));
        if($('#exportModal').find('#exportLATEX-textarea').attr("rows") > codeLateX.length) {
            $('#exportModal').find('#exportLATEX-textarea').attr('rows', codeLateX.length + 2);
        } else {
            $('#exportModal').find('#exportLATEX-textarea').attr('rows', $('#exportModal').find('#exportLATEX-textarea').attr("rows"));
        }
        $('#exportModal').find('#exportLATEX-textarea').css('display', 'inline');
    }
}

function generateLateX(graph) {

    var latexLines = [];

    var tokensLine = '';
    var posLine = '';
    var deprelLines = [];
    for(var i = 0; i < graph.length; i++) {
        if(graph[i].classes.indexOf('wf') !== -1) {
            if(graph[i].data.upostag == undefined) {
                return 'error';
            }
            tokensLine += ' \\& ' + graph[i].data.label;
            posLine += '\\&{\\tt ' + graph[i].data.upostag + '}';
        }

        if(graph[i].classes == 'dependency' || graph[i].classes == 'dependency error') {
            if(graph[i].data.label == undefined) {
                return 'error';
            }
            var source = parseInt(graph[i].data.source.replace('nf', ''));
            var target = parseInt(graph[i].data.target.replace('nf', ''));
            var label = ''
            if(graph[i].data.label != undefined) {
                label = graph[i].data.label.replace(/[⊳⊲]/, '');
            }
            deprelLines.push('\depedge{' + source + '}{' + target + '}' + '{' + label + '}');
        }
    }
    tokensLine += ' \\\\';
    tokensLine = tokensLine.replace('\\&', '');

    posLine += '\\\\';
    posLine = posLine.replace('\\&', '');

    latexLines.push('\\begin{dependency}',
                    '   \\begin{deptext}[column sep=0.4cm]');
    latexLines.push('       ' + tokensLine);
    latexLines.push('       ' + posLine);
    latexLines.push('   \\end{deptext}');
    for(var i = 0; i < deprelLines.length; i++) {
        latexLines.push('   \\' + deprelLines[i]);
    }
    latexLines.push('\\end{dependency} \\\\');
    return latexLines;
}

function findSupTokId(subtokens) {
    return subtokens[0].id + "-" + subtokens[subtokens.length - 1].id;
}

/**
 * Converts a string to subscripts.
 * @param  {String} str A string.
 * @return {String}     Returns the subscript conversion of the string.
 */
function toSubscript(str) {
    var lowDigits = {0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅",
    6: "₆", 7: "₇", 8: "₈", 9: "₉", "-": "₋", "(" : "₍", ")" : "₎"};
    var substr = "";
    for(var i = 0; i < str.length; i++) {
        var newChar = str[i];
        if(newChar in lowDigits) {
            newChar = lowDigits[newChar];
        }
        substr += newChar;
    }
    return substr;
}

/**
 * Creates the wf node, the POS node and dependencies.
 * @param  {Array}  graph  A graph containing all the nodes and dependencies.
 * @param  {Object} token  Token object.
 * @param  {String} spId   Id of supertoken.
 * @return {Array}         Returns the graph.
 */
function createToken(graph, token, spId) {
    //console.log('createToken() '+ token.id + ' / ' + spId + ' / ' + token.form + ' / ' + token.upostag);
    /* Takes the tree graph, a token object and the id of the supertoken.
    Creates the wf node, the POS node and dependencies. Returns the graph. */

    // handling empty form
    // if (spId) {token.form = token.lemma};
    if (token.form == undefined) {token.form = " "};

    // TODO: We shouldn't need to hold information in multiple places
    // at least not like this.
    TREE_[token.id] = token;

    var nodeId = strWithZero(token.id);
    // token number
    graph.push({
        "data": {
            "id": "num" + nodeId,
            "label": +nodeId,         // do we need the '+' here ?
            "pos": +token.upostag,
            "parent": spId
        },
        "classes": "tokenNumber"
    })

    var nodeWF = token;
    // nodeWF.parent = spId;
    nodeWF.length = measureText(nodeWF.form);
    nodeWF.id = "nf" + nodeId;
    nodeWF.label = nodeWF.form;
    nodeWF.state = "normal";

    nodeWF.parent = "num" + nodeId;
    if (token.head && token.head == 0 ) { // for root node
        var rootNode = " root";
    } else {
        var rootNode = "";
    }

    graph.push({"data": nodeWF, "classes": "wf"+rootNode});

    graph = makePOS(token, nodeId, graph);

    if(!VIEW_ENHANCED) {
        graph = makeDependencies(token, nodeId, graph);
    }


    return graph;
}

function makeEnhancedDependency(token, nodeId, head, deprel, graph) {
    console.log('makeEnhancedDependencies()', nodeId, head, deprel);
    console.log('makeEnhancedDependencies()', token);

    var nId = parseInt(nodeId.slice(2));
    if (head != 0) {
	var headId = strWithZero(head);
        var edgeDep = {
            "id": "ed" + nodeId + ":" + headId,
            "source": "nf" + headId,
            //"target": "nf" + nodeId,
            "target": nodeId,
            "length": (deprel.length / 3) + "em",
            "label": deprel,
            "ctrl": [edgeHeight, edgeHeight, edgeHeight, edgeHeight] // ARC HEIGHT STUFFS
        }
        console.log('makeEnhancedDependency()',edgeDep['id'], edgeDep['source'], edgeDep['target'], edgeDep['label']);
        console.log('makeEnhancedDependency()',edgeDep['ctrl']);
        var coef = (head - nId);
        if (Math.abs(coef) != 1) {coef *= defaultCoef};
        edgeDep.ctrl = edgeDep.ctrl.map(function(el){ return el*coef; });

        console.log('makeEnhancedDependency()',edgeDep['ctrl']);

        graph.push({"data": edgeDep, "classes": "enhanced"});
    };
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
	var deprel = (token.deprel) ? token.deprel : "";
	var head = token.head; // The id of the head

	var validDep = true;

	//console.log(TREE_);
//	console.log(TREE_[head]);

	if(head in TREE_) { // for some reason we need this part
		// if the pos tag of the head is in the list of leaf nodes, then
		// mark it as an error.
		var res = is_leaf(TREE_[head].upostag);
		if(res[0]) {
			// console.log('[1] writeDeprel @valid=false ' + deprel + ' // ' + res[1]);
			validDep = false;
		}
	}

	if(deprel != "") {
		var res = is_udeprel(deprel);
		if(!res[0]) {
			// if the deprel is not valid, mark it as an error, but
			// don't mark it as an error if it's blank.
			// console.log('[2] writeDeprel @valid=false ' + deprel + ' // ' + res[1]);
			validDep = false;
		}
	}

	// Append ⊲ or ⊳ to indicate direction of the arc (helpful if
	// there are many arcs.
	var deprelLabel = deprel;
	if(parseInt(head) < parseInt(nodeId) && LEFT_TO_RIGHT) {
		deprelLabel = deprelLabel + '⊳';
	} else if(parseInt(head) > parseInt(nodeId) && LEFT_TO_RIGHT) {
		deprelLabel = '⊲' + deprelLabel;
	} else if(parseInt(head) < parseInt(nodeId) && !LEFT_TO_RIGHT) {
		deprelLabel = '⊲' + deprelLabel;
	} else if(parseInt(head) > parseInt(nodeId) && !LEFT_TO_RIGHT) {
		deprelLabel = deprelLabel + '⊳';
	}

	if (token.head && token.head != 0) {
		var headId = strWithZero(head);
		var edgeDep = {
			"id": "ed" + nodeId,
			"source": "nf" + headId,
			"target": "nf" + nodeId,
			"length": (deprelLabel.length / 3) + "em",
			"label": deprelLabel,
			"ctrl": [edgeHeight, edgeHeight, edgeHeight, edgeHeight] // ARC HEIGHT STUFFS

		}
		var coef = (head - nodeId);
		if (!LEFT_TO_RIGHT) {coef *= -1}; // support for RTL
		//if (VERT_ALIGNMENT) {edgeDep.ctrl = [90, 90, 90, 90]};
		if (VERT_ALIGNMENT) {edgeDep.ctrl = [45, 45, 45, 45]};
		if (Math.abs(coef) != 1) {coef *= defaultCoef};
		edgeDep.ctrl = edgeDep.ctrl.map(function(el){ return el*coef; });

                //if(token.upostag == 'PUNCT' && !is_projective(TREE_, [parseInt(nodeId)])){
                //    validDep = false;
                //    console.log('WARNING: Non-projective punctuation');
                //}
		// if it's not valid, mark it as an error (see cy-style.js)
		if(validDep && deprel != "" && deprel != undefined) {
			graph.push({"data": edgeDep, "classes": "dependency"});
			//console.log("makeDependencies(): valid @" + deprel);
		} else if (deprel == "" || deprel == undefined) {
			graph.push({"data": edgeDep, "classes": "dependency incomplete"});
			//console.log("makeDependencies(): incomplete @" + deprel);
		}else{
			graph.push({"data": edgeDep, "classes": "dependency error"});
			//console.log("makeDependencies(): error @" + deprel);
		}


                // If dependency cycle exists, mark the cycle as red.
                var res2 = is_depend_cycles(TREE_);
                if (res2 !== null) {
                    for(var cycl = 0; cycl < res2.length; cycl++) {
                        for (var cycleInd = 0; cycleInd < res2[cycl].length; cycleInd++) {
                            var wrapInd = cycleInd + 1 >= res2[cycl].length ? 0 : cycleInd + 1;
                            for (var graphInd = 0; graphInd < graph.length; graphInd++) {
                                if(graph[graphInd].data.source !== undefined && graph[graphInd].data.target !== undefined && parseInt(graph[graphInd].data.target.substr(2)) === res2[cycl][cycleInd] && parseInt(graph[graphInd].data.source.substr(2)) === res2[cycl][wrapInd]) {
                                    graph[graphInd].classes = "dependency error";
                                }
                            }
                        }
                    }
                }

                var res3 = is_relation_conflict(TREE_);
                for (var graphInd = 0; graphInd < graph.length; graphInd++) {
                    if(graph[graphInd].classes.substring(0,10) === "dependency") {
                        var graphLabel = graph[graphInd].data.label;
                        var graphSource = String(parseInt(graph[graphInd].data.source.substring(2)));
                        if(res3.has(graphSource)) {
                            var conflicts = res3.get(graphSource);
                            if(conflicts.indexOf("obj") !== -1 && (graphLabel === "obj⊳" || graphLabel === "⊲obj")) {
                                graph[graphInd].classes = "dependency error";
                            }
                            if(conflicts.indexOf("subj") !== -1 && (graphLabel === "csubj⊳" || graphLabel === "⊲csubj" || graphLabel === "⊲nsubj" || graphLabel === "nsubj⊳")) {
                                graph[graphInd].classes = "dependency error";
                            }
                        }
                        if(res3.has("objccomp") && (graphLabel === "obj⊳" || graphLabel === "⊲obj" || graphLabel === "ccomp⊳" || graphLabel === "⊲ccomp")) {
                                graph[graphInd].classes = "dependency error";
                        }
                    }
                }
		/*if(!res[0]) {
			//console.log('[3] writeDeprel is_cyclic=true');
		} else {
			//console.log('[3] writeDeprel is_cyclic=false');
		}*/
		//console.log(edgeDep);
	};
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
    /* Creates nodes for POS and edges between wf and POS nodes */

    var pos = "";
    if (token.upostag != undefined) {
        pos = token.upostag;
    } else if (token.xpostag != undefined) {
        pos = token.xpostag;
    };

    // creating pos node
    var nodePOS = {
        "id": "np" + nodeId,
        "label": pos,
        "length": measureText(pos)
    }
    graph.push({"data": nodePOS, "classes": "pos"});

    // the edge from token to POS
    var edgePOS = {
        "id": "ep" + nodeId,
        "source": "nf" + nodeId,
        "target": nodePOS.id
    }
    graph.push({"data": edgePOS, "classes": "pos"});

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
	// If only one number was passed in make it the finish and 0 the start.
	if (arguments.length == 1) {
		finish = start;
		start = 0;
	}

	// Validate the finish and step numbers.
	finish = finish || 0;
	step = step || 1;

	// If start is greater than finish, reverse.
	if (start > finish) {
		var temp = start;
		start = finish;
		finish = temp;
	}

	start = start+1;
	//finish = finish-1;
	// Create the array of numbers, stopping before the finish.
	for (var ret = []; (finish - start) * step > 0; start += step) {
		ret.push(start);
	}
	return ret;
}

/**
 * Makes the dependency edges easier to see and overlap less.
 */
function cleanEdges() {
	var sources = {}
	var edges = {}
	$.each(cy.filter('edge[id*="ed"]'), function (a, thisEdge) {
		if (thisEdge.data('source') != thisEdge.data('target')) {
			//console.log(thisEdge);
			var sourceNode = parseInt(thisEdge.data('source').replace("nf",""));
			var targetNode = parseInt(thisEdge.data('target').replace("nf",""));
			sources[targetNode] = sourceNode;
			edges[targetNode] = thisEdge;
			//var diff = Math.abs(sourceNode - targetNode);
			//console.log(thisEdge.data(), sourceNode, targetNode);
			//		 (thisEdge.data(), thisEdge.data('source').replace("nf",""), thisEdge.data('target').replace("nf",""));
			//thisEdge.data({'ctrl': [thisHeight, thisHeight, thisHeight, thisHeight]});
		}

	});

	// calculate max heights
	var maxes = {}
	$.each(edges, function (targetNode, thisEdge) {
		var howHigh = 1;
		var diff = Math.abs(targetNode - sources[targetNode]);
		//console.log(diff);
		maxes[parseInt(targetNode)] = diff;
	});
	//console.log('[0] cleanEdges() maxes:' + maxes);

	// set height to max intervening height + 1
	//console.log("Sources", sources);
	//console.log("Maxes", maxes);
	$.each(edges, function (targetNode, thisEdge) {
		var sourceNode = sources[targetNode] ;
		var targ = parseInt(targetNode)
		var sorc = parseInt(sourceNode)
		var diff = Math.abs(targ - sorc);
		var howHigh = 1;
		var increment = -1 ;
		if (targetNode<sourceNode) { increment = 1; } // else { increment = -1 };
		if (diff > 1) {
			var maxFound = 1;
			var highest = (targ > sorc) ? targ : sorc;
			var lowest = (targ < sorc) ? targ : sorc;
			var toCheck = rangeExclusive(targ, sorc, Math.abs(increment));
			//console.log(maxes);
			//console.log("[1] cleanEdges() BEFORE LOOP:", targ, sorc, toCheck, rangeExclusive(targ, sorc, 1));
			$.each(toCheck, function(x, i) {
				if (maxes[i] > maxFound) {
					maxFound = maxes[i];
				}
				//console.log('[2] cleanEdges()', targ, sorc, i, maxFound);
			});
			//console.log("BEFORE LOOP", targ, sorc, increment, targ+increment, sorc-increment);
			/**for (i=targ+increment; i=sorc-increment; i+=increment) {
				console.log(targ, i, maxFound);
				if (maxes[i] > maxFound) {
					maxFound = maxes[i];
				}
			}**/
			howHigh = maxFound +1;
			maxes[targetNode] = howHigh;
			//console.log(targetNode, howHigh, "—", maxes);
			//if (!is_projective_nodes(TREE_, [sourceNode])) {
			//	alert("ISN'T PROJECTIVE", sourceNode);
			//}
			//console.log(highest, lowest, sources[i]);
			//if (sources[i] >= highest || sources[i] <= lowest) {
			//	console.log("cleanEdges()", i, "CROSSES");
		}

		//if (!LEFT_TO_RIGHT) {var RTL = -1} else {var RTL = 1}; // support for RTL
		//var thisHeight = edgeHeight * defaultCoef * howHigh * increment * RTL;
		//console.log("[0]", sorc, targ, increment, howHigh);
		var thisHeight = edgeHeight * defaultCoef * howHigh;
		//console.log("HARGLE "+thisHeight);
		setEdgePosition(thisEdge, thisHeight, increment, diff);
		//thisEdge.style({"control-point-weights": "0.05 0.25 0.75 0.95"});
		//thisEdge.data({'ctrl': [thisHeight/1.5, thisHeight, thisHeight, thisHeight/1.5]});
		//thisEdge.style({"source-endpoint": String(-15*increment)+"% -50%"});
		//thisEdge.style({"target-endpoint": String(0*increment)+"% -50%"});
	});
	//console.log(sources);
	//cy.filter('edge[id="ed12"]').data({'ctrl': [thisHeight, thisHeight, thisHeight, thisHeight]});
	//cy.filter('edge[id="ed12"]').data({'ctrl': [34,50,40,20]}); //.ctrl = [50,34,34,40]); //graph.filter('edge[id="n12"]');//, TREE_);

	// go back through and test if any intervening nodes have arcs that cross this one
	$.each(edges, function (targetNode, thisEdge) {
		var sourceNode = sources[targetNode] ;
		var targ = parseInt(targetNode);
		var sorc = parseInt(sourceNode);
		var diff = Math.abs(targ - sorc);
		var verticalStagger = 0;
		if (diff > 1) {
			var toCheck = rangeExclusive(targ, sorc, 1);
			var thisMax = maxes[targetNode];
			$.each(toCheck, function(x, i) {
				//console.log("HARGLE", sorc, thisMax, maxes[i]);
				if (maxes[i] == thisMax+1 || maxes[i] == undefined) {
					verticalStagger = staggersize;
				}
			});
		}
		var thisHeight = thisEdge.data()['ctrl'][0];
		//console.log("HARGLE "+thisHeight, verticalStagger);
		//console.log("HARGLE "+thisHeight, verticalStagger);
		thisHeight += verticalStagger;
		//setEdgePosition(thisEdge, thisHeight, 1);
	});
}

/**
 * Sets the position of an edge.
 * @param {Object} thisEdge   The edge being positioned.
 * @param {Number} thisHeight The height the edge should be positioned at.
 * @param {Number} coef       The direction the edge is going: either -1 or 1.
 * @param {Number} diff       How far the edge stretches between nodes.
 */
function setEdgePosition(thisEdge, thisHeight, coef, diff) {
	if (!LEFT_TO_RIGHT) {coef *= -1}; // support for RTL
	//if (VERT_ALIGNMENT) {edgeDep.ctrl = [45, 45, 45, 45]};
	//if (Math.abs(coef) != 1) {coef *= defaultCoef};
  if(VERT_ALIGNMENT) {thisHeight += 30} // so the ctrl points are better placed

	thisHeight *= coef;

	//console.log(thisEdge);
	var factor1 = 2 - (Math.abs(thisHeight)/edgeHeight)/10;
	var factor2 = 1 + ((Math.abs(thisHeight) - edgeHeight)/edgeHeight)/10;
	var factor3 = 1 + (edgeHeight/(Math.abs(thisHeight)/edgeHeight))/80;
	var factor4 = 10 * (edgeHeight/(Math.abs(thisHeight)));
	var factor = factor4;

	// console.log("setEdgePosition()", thisHeight, coef, factor);
	if (diff == 1) {
		thisEdge.style({"control-point-weights": "0.15 0.25 0.75 1"});
		thisEdge.data({'ctrl': [thisHeight/1.25, thisHeight, thisHeight, thisHeight]});
	} else {
		thisEdge.style({"control-point-weights": String(0.01*factor)+" 0.25 0.75 1"});
		thisEdge.data({'ctrl': [thisHeight, thisHeight, thisHeight, thisHeight]});
	}
  if (!VERT_ALIGNMENT) {
	  thisEdge.style({"source-endpoint": String(-10*coef)+"px -50%"});
	  thisEdge.style({"target-endpoint": String(0*coef)+"% -50%"});
  } else {
    var sourceNum = String(parseInt(thisEdge.data('source').replace("nf", ""), 10)).length*10 + "px"
    var targetNum = String(parseInt(thisEdge.data('target').replace("nf", ""), 10)).length*10 + "px"
    thisEdge.style({"source-distance-from-node": sourceNum})
    thisEdge.style({"target-distance-from-node": targetNum})
  }

	//edgeDep.ctrl = edgeDep.ctrl.map(function(el){ return el*coef; });
}

function simpleIdSorting(n1, n2) {
    if( n1.id() < n2.id() ){
        return -1;
    } else if( n1.id() > n2.id() ){
        return 1;
    } else {
        return 0;
    }
}


function rtlSorting(n1, n2) {
    if ((n1.hasClass("wf") && n2.hasClass("wf")) // if the nodes have the same class
        || (n1.hasClass("pos") && n2.hasClass("pos"))) {
        return simpleIdSorting(n1, n2) * -1;
    } else if (n1.hasClass("wf") && n2.hasClass("pos")) {
        return -1;
    } else if (n1.hasClass("pos") && n2.hasClass("wf")) {
        return 1;
    } else {
        return 0;
    }
}


function vertAlSort(n1, n2) {
    var num1 = +n1.id().slice(2);
    var num2 = +n2.id().slice(2);
    if (num1 != num2) {
        return num1 - num2;
    } else {
        if (n1.hasClass("wf") && n2.hasClass("pos")) {
            return 1;
        } else if (n1.hasClass("pos") && n2.hasClass("wf")) {
            return -1
        } else {
            return 0;
        }
    }
}


function strWithZero(num) {
    return (String(num).length > 1) ? "" + num : "0" + num;
}


/* TODO:

var nodeWF = Object.create(token);
...
nodePOS = Object.create(token);
...

*/
