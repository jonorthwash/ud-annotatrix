"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var DEL_KEY = 46;
var BACKSPACE = 8;
var ENTER = 13;
var ESC = 27;
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
var SIDES = {39: "right", 37: "left"};
var POS2RELmappings = {
	"PUNCT": "punct",
	"DET": "det",
	"CCONJ": "cc",
	"SCONJ": "mark"
}


function setUndos(undoManager) {
    var btnUndo = document.getElementById("btnUndo");
    var btnRedo = document.getElementById("btnRedo");

    function updateUI() {
        btnUndo.disabled = !undoManager.hasUndo();
        btnRedo.disabled = !undoManager.hasRedo();
    }
    undoManager.setCallback(updateUI);

    btnUndo.onclick = function () {
        undoManager.undo();
        updateUI();
    };
    btnRedo.onclick = function () {
        undoManager.redo();
        updateUI();
    };

    updateUI();
}


function drawArcs(evt) {
    /* Called when a node is clicked. */

    // if the user clicked an activated node
    if (this.hasClass("activated")) {
        this.removeClass("activated");
    } else {
        // look for other activated nodes
        var actNode = cy.$(".activated");

        this.addClass("activated");
        
        // if there is an activated node already
        if (actNode.length == 1) {
            writeArc(actNode, this);
        }
    };
}


function writeArc(sourceNode, destNode) {
    /*
    Called in drawArcs. Makes changes to the text data and calls the function
    redrawing the tree. Currently supports only conllu.
    */

    var sourceIndex = +sourceNode.data("id").slice(2);
    var destIndex = +destNode.data("id").slice(2);

    var indices = findConlluId(destNode);
    // For some reason we need all of this code otherwise stuff becomes undefined
    var idx = findConlluId(destNode)[1];
    var sent = buildSent();
    var tokens = sent.tokens;
    console.log(idx + ' ' + tokens);
    var thisToken = tokens[idx];
    console.log('writeArc ' + destIndex + ' ' + thisToken['upostag']); 
    var sentAndPrev = changeConlluAttr(sent, indices, "head", sourceIndex);

    // If the target POS tag is PUNCT set the deprel to @punct [99%]
    // IF the target POS tag is CCONJ set the deprel to @cc [88%]
    // IF the target POS tag is SCONJ set the deprel to @mark [86%]
    // IF the target POS tag is DET set the deprel to @det [83%]
    // TODO: Put this somewhere better
    if(thisToken['upostag'] in POS2RELmappings) {
        sentAndPrev = changeConlluAttr(sent, indices, "deprel", POS2RELmappings[thisToken['upostag']])
    }

    var validDep = true;
    if(thisToken['upostag'] == 'PUNCT' && !is_projective_nodes(sent.tokens, [destIndex])){
        validDep = false;
        console.log('WARNING: Non-projective punctuation');
    }


    sent = sentAndPrev[0];
    var pervVal = sentAndPrev[1];

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            var sentAndPrev = changeConlluAttr(sent, indices, "head", pervVal);
            sent = sentAndPrev[0];
            redrawTree(sent);
        },
        redo: function(){
            writeArc(sourceNode, destNode);
        }
    });

    redrawTree(sent);
}


function removeArc(destNodes) {
    /* Removes all the selected edges. */

    var sent = buildSent();
    var prevRelations = {}

    // support for multiple arcs
    $.each(destNodes, function(i, node) {
        var destIndex = node.id().slice(2);
        var indices = findConlluId(node);
        var sentAndPrev = changeConlluAttr(sent, indices, "head", undefined);
        sent = sentAndPrev[0];
        prevRelations["head"] = sentAndPrev[1];
        var sentAndPrev = changeConlluAttr(sent, indices, "deprel", undefined);
        sent = sentAndPrev[0];
        prevRelations["deprel"] = sentAndPrev[1];
    });

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            $.each(destNodes, function(i, node) {
                var destIndex = node.id().slice(2);
                var indices = findConlluId(node);
                var sentAndPrev = changeConlluAttr(sent, indices, "head", prevRelations.head);
                sent = sentAndPrev[0];
                var sentAndPrev = changeConlluAttr(sent, indices, "deprel", prevRelations.deprel);
                sent = sentAndPrev[0];
            })
            redrawTree(sent);
        },
        redo: function(){
            removeArc(destNodes);
        }
    });

    redrawTree(sent);
}


function selectArc() {
    /* 
    Activated when an arc is selected. Adds classes showing what is selected.
    */

    // if the user clicked an activated node
    if (this.hasClass("selected")) {
        this.removeClass("selected");

        // removing visual effects from destNode
        var destNodeId = this.data("target");
        cy.$("#" + destNodeId).removeClass("arc-selected");

    } else {
        this.addClass("selected");
        var destNodeId = this.data("target"); // getting info about nodes
        cy.$("#" + destNodeId).addClass("arc-selected"); // css for destNode
    }

    // for identifying the node
    cy.$("#" + destNodeId).data("state", "arc-dest");
}


function selectSup() {
    if (this.hasClass("supAct")) {
        this.removeClass("supAct");
    } else {
        this.addClass("supAct");
    }
}


function keyUpClassifier(key) {
    // looking if there are selected arcs
    var selArcs = cy.$("edge.dependency.selected");  // + cy.$("edge.dependency.error");
    var destNodes = cy.$("node[state='arc-dest']");
    // looking if there is a POS label to be modified
    var posInp = $(".activated.np");
    // looking if there is a wf label to be modified
    var wfInp = $(".activated.nf");
    // looking if there is a deprel label to be modified
    var deprelInp = $(".activated.ed");
    // looking if some wf node is selected
    var wf = cy.$("node.wf.activated");
    // looking if a supertoken node is selected
    var st = cy.$(".supAct");
    // looking if some node waits to be merged
    var toMerge = cy.$(".merge");
    // looking if some node waits to be merged to supertoken
    var toSup = cy.$(".supertoken");

    if (selArcs.length) {
        if (key.which == DEL_KEY || key.which == BACKSPACE) {
            removeArc(destNodes);
        } else if (key.which == ESC) {
            drawTree();
        } else if (key.which == D) {
            moveArc();
        };
    } else if (posInp.length) {
        if (key.which == ENTER) {
            writePOS(posInp.val());
        };
    } else if (wfInp.length) {
        if (key.which == ENTER) {
            writeWF(wfInp);
        };
    } else if (deprelInp.length) {
        if (key.which == ENTER) {
            var res = deprelInp.val();
            // to get rid of the magic direction arrows
            res = res.replace(/[⊳⊲]/, '');
            writeDeprel(res);
        };
    } else if (wf.length == 1) {
        if (key.which == M) {
            wf.addClass("merge");
            wf.removeClass("activated");
        } else if (key.which == S) {
            wf.addClass("supertoken");
            wf.removeClass("activated");
        } else if (key.which == R) {
            setRoot(wf);
        };
    } else if (toMerge.length) {
        if (key.which in SIDES) {
            mergeNodes(toMerge, SIDES[key.which], "subtoken");
        }
    } else if (toSup.length) {
        if (key.which in SIDES) {
            mergeNodes(toSup, SIDES[key.which], "supertoken");
        }
    } else if (st.length) {
        if (key.which == DEL_KEY || key.which == BACKSPACE) {
            removeSup(st);
        }
    }
    //console.log('KEY: ' + key.which);
    var inputAreaFocus = $("#indata").is(":focus");
    // console.log('KEY: ' + key.which, inputAreaFocus);
    if(!inputAreaFocus) {
        // console.log('ZOOM: ', CURRENT_ZOOM, inputAreaFocus);
        if((key.which == EQUALS || key.which == 61) ){
            CURRENT_ZOOM = cy.zoom();
            if(key.shiftKey) { // zoom in
                CURRENT_ZOOM += 0.1;
            }  else {  // fit to screen
                CURRENT_ZOOM = cy.fit(); 
            }
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if((key.which == MINUS || key.which == 173) ) { // zoom out
            CURRENT_ZOOM = cy.zoom();
            //if(key.shiftKey) { 
                CURRENT_ZOOM -= 0.1;
            //}
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        } else if(key.which == 48 ) { // 0 = zoom 1.0
            CURRENT_ZOOM = 1.0;
            cy.zoom(CURRENT_ZOOM);
            cy.center();
        }
    }
}


function moveArc() {
    /* Activated after the key responsible for "move dependent" key. */

    // reset the handlers
    var nodes = $("rect[data-span-id]");
    $.each(nodes, function(n, node){
        node.removeEventListener("click", drawArcs);
        node.addEventListener("click", getArc);
    });  
}


function removeSup(st) {
    /* Support for removing supertokens.
    The function takes the cy-element of superoken that was selected,
    removes it and inserts its former subtokens. */
    var sent = buildSent();
    var currentId = +st.id().slice(2); // the id of the supertoken to be removed
    var subTokens = sent.tokens[currentId].tokens; // getting its children
    sent.tokens.splice(currentId, 1); // removing the multiword token
    $.each(subTokens, function(n, tok) { // inserting the subtokens
        sent.tokens.splice(currentId + n, 0, tok);
    });
    redrawTree(sent);
}


function changeNode() {
    console.log("changeNode() " + Object.entries(this) + " // " + this.id());

    this.addClass("input");
    var id = this.id().slice(0, 2);
    var param = this.renderedBoundingBox();
    param.color = this.style("background-color");
    var nodeType;
    if (id == "ed") {
        param = changeEdgeParam(param);
        nodeType = "DEPREL";
    }
    if (id == "np") {nodeType = "UPOS"};

    // for some reason, there are problems with label in deprels without this 
    if (this.data("label") == undefined) {this.data("label", "")};

    // to get rid of the magic direction arrows
    var res = this.data("label").replace(/[⊳⊲]/, '');
    this.data("label", res);

 //   console.log("[2] changeNode() " + this.data("label") + " " + res);

    $("#mute").addClass("activated");
    var sent = buildSent();
    var length = sent.tokens.length;
    if (VERT_ALIGNMENT) {
        $(".activated#mute").css("height", (length * 50) + "px");
    } else {
        //$(".activated#mute").css("width", "1500px");
        $(".activated#mute").css("width", $(window).width()-10);
    }

    // TODO: rank the labels + make the style better  
    var availableLabels = [];
    if(nodeType == "UPOS") {
        availableLabels = U_POS; 
    } else if(nodeType == "DEPREL") { 
        availableLabels = U_DEPRELS;
    }
    console.log('availableLabels:', availableLabels);
 
    // autocomplete

    $('#edit').selfcomplete({lookup: availableLabels, 
        tabDisabled: false,
        autoSelectFirst:true,
        lookupLimit:5
    });

    $("#edit").css("top", param.y1)
        .css("left", param.x1)
        .css("height", param.h)
        .css("width", param.w)
        //.css("background-color", param.color)
        .attr("value", this.data("label"))
        .addClass("activated")
        .addClass(id);


    $("#edit").focus();

}


function changeEdgeParam(param) {
    param.w = 100;
    param.h = cy.nodes()[0].renderedHeight();
    if (VERT_ALIGNMENT) {
        param.y1 = param.y1 + (param.y2 - param.y1)/2 - 15;
        param.x1 = param.x2 - 70;
    } else {
        param.x1 = param.x1 + (param.x2 - param.x1)/2 - 50;
    }
    param.color = "white";
    return param;
}


function find2change() {
    /* Selects a cy element to be changed, returns its index. */
    var active = cy.$(".input");
    var Id = active.id().slice(2) - 1;
    return Id;
}


function setRoot(wf) {
   var sent = buildSent();
   var indices = findConlluId(wf);
   var outerIndex = indices[1];
   var cur = parseInt(sent.tokens[outerIndex].id);
   var head = 0;
   console.log('setRoot()', outerIndex, cur, head);
   var sentAndPrev = changeConlluAttr(sent, indices, "deprel", "root");
   var sentAndPrev = changeConlluAttr(sent, indices, "head", head);

   redrawTree(sent);
}



function writeDeprel(deprelInp, indices) { // TODO: DRY
    /* Writes changes to deprel label. */

    // getting indices
    if (indices == undefined) {
        var active = cy.$(".input");
        var Id = active.id().slice(2);
        var wfNode = cy.$("#nf" + Id);
        var indices = findConlluId(wfNode);
    } 

    var sent = buildSent();
 
    var outerIndex = indices[1];
    var cur = parseInt(sent.tokens[outerIndex].id);
    var head = parseInt(sent.tokens[outerIndex].head);
    console.log('writeDeprel');
    console.log(head + ' ' + cur);

    var sentAndPrev = changeConlluAttr(sent, indices, "deprel", deprelInp);
    sent = sentAndPrev[0];
    var pervVal = sentAndPrev[1];

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            var sentAndPrev = changeConlluAttr(sent, indices, "deprel", pervVal);
            sent = sentAndPrev[0];
            redrawTree(sent);
        },
        redo: function(){
            writeDeprel(deprelInp, indices);
        }
    });

    redrawTree(sent);
}


function writePOS(posInp, indices) {
    /* Writes changes to POS label. */

    // getting indices
    if (indices == undefined) {
        var active = cy.$(".input");
        var Id = active.id().slice(2);
        var wfNode = cy.$("#nf" + Id);
        var indices = findConlluId(wfNode);
    }

    var sent = buildSent();
    var sentAndPrev = changeConlluAttr(sent, indices, "upostag", posInp);
    sent = sentAndPrev[0];
    var pervVal = sentAndPrev[1];

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            var sentAndPrev = changeConlluAttr(sent, indices, "upostag", pervVal);
            sent = sentAndPrev[0];
            redrawTree(sent);
        },
        redo: function(){
            writePOS(posInp, indices);
        }
    });

    redrawTree(sent);

}


function changeConlluAttr(sent, indices, attrName, newVal) {
    var isSubtoken = indices[0];
    var outerIndex = indices[1];
    var innerIndex = indices[2];
 
    //if(attrName == "deprel") {
    //  newVal = newVal.replace(/[⊲⊳]/g, '');
    //}
    if (isSubtoken) {
        var pervVal = sent.tokens[outerIndex].tokens[innerIndex][attrName];
        sent.tokens[outerIndex].tokens[innerIndex][attrName] = newVal;
    } else {
        var pervVal = sent.tokens[outerIndex][attrName];
        sent.tokens[outerIndex][attrName] = newVal;
    }
    return [sent, pervVal]
}


function writeWF(wfInp) {
    /* Either writes changes to token or retokenises the sentence. */
    var newToken = wfInp.val().trim();

    var active = cy.$(".input");
    var indices = findConlluId(active);
    console.log(indices);
    var isSubtoken = indices[0];
    var outerIndex = indices[1];
    var innerIndex = indices[2];

    var sent = buildSent();

    if (newToken.includes(" ")) { // this was a temporal solution. refactor.
        splitTokens(newToken, sent, indices);
    } else {
        if (isSubtoken) {
            // TODO: think, whether it should be lemma or form.
            // sent.tokens[outerIndex].tokens[innerIndex].lemma = newToken;
            sent.tokens[outerIndex].tokens[innerIndex].form = newToken;
        } else {
            sent.tokens[outerIndex].form = newToken;
        }
        redrawTree(sent);
    }
}


function findConlluId(wfNode) { // TODO: refactor the arcitecture.
    // takes a cy wf node

    var isSubtoken = false;
    var outerIndex;
    var innerIndex;

    var parentId = findParentId(wfNode);
    if (parentId != undefined) {
        isSubtoken = true;
        var children = cy.$("#" + parentId).children();
        outerIndex = +parentId.slice(2);
        for (var i = 0; i < children.length; ++i) {
            if (children[i].children()[0].id() == wfNode.id()){
                innerIndex = i;
            }
        }
    } else {
        var tokNumber = +wfNode.id().slice(2);
        var sent = buildSent();
        for (var i = 0; i < sent.tokens.length; ++i) {
            if (sent.tokens[i].id == tokNumber) {
                outerIndex = i;
            }
        }
    }
    return [isSubtoken, outerIndex, innerIndex];
}


function findParentId(wfNode) {
    var parId = wfNode.data("parent");
    var firstPar = cy.$("#" + parId);
    var secParId = firstPar.data("parent");
    return secParId;
}


function thereIsSupertoken(sent) {
    /* Indicates that a sent contains supertoken.\
    Is notused anywhere at tye moment */
    var supTokFound = false;
    $.each(sent.tokens, function(n, tok) {
        if (tok instanceof conllu.MultiwordToken) {
            supTokFound = true;
        } 
    })
    return supTokFound;
}


function splitTokens(oldToken, sent, indices) {
    /* Takes a token to retokenize with space in it and the Id of the token.
    Creates the new tokens, makes indices and head shifting, redraws the tree.
    All the attributes default to belong to the first part. */
    var isSubtoken = indices[0];
    var outerIndex = indices[1];
    var innerIndex = indices[2];

    var newTokens = oldToken.split(" ");
    if (isSubtoken) {
        sent.tokens[outerIndex].tokens[innerIndex].form = newTokens[0];
        var tokId = sent.tokens[outerIndex].tokens[innerIndex].id;

        // creating and inserting the second part
        var restTok = formNewToken({"id": tokId, "form": newTokens[1]});
        sent.tokens[outerIndex].tokens.splice(innerIndex + 1, 0, restTok);
    } else {
        sent.tokens[outerIndex].form = newTokens[0];
        var tokId = sent.tokens[outerIndex].id;

        // creating and inserting the second part
        var restTok = formNewToken({"id": tokId, "form": newTokens[1]});
        sent.tokens.splice(outerIndex + 1, 0, restTok);
    }


    $.each(sent.tokens, function(i, tok){
        if (tok instanceof conllu.MultiwordToken) {
            $.each(tok.tokens, function(j, subtok) {
                subtok = shiftIndices(subtok, i, outerIndex, innerIndex, j);
            })
        } else if (tok instanceof conllu.Token) {
            tok = shiftIndices(tok, i, outerIndex);
        }
    });
    redrawTree(sent);
}


function shiftIndices(tok, i, outerIndex, innerIndex, j) {
    if (i > outerIndex || (innerIndex != undefined && j > innerIndex)) {
        tok.id = tok.id + 1;
    }
    if (tok.head > outerIndex + 1){
        tok.head = +tok.head + 1;
    };
    return tok;
}


function renumberNodes(nodeId, otherId, sent, side) {
    /* Shifts the node and head indices to the right. */
    $.each(sent.tokens, function(n, tok){
        if ((side == "right" && tok.head > nodeId + 1)
            || (side == "left" && tok.head > otherId)){
            tok.head = +tok.head - 1; // head correction
        };
        if ((side == "right" && n > nodeId)
            || (side == "left" && n >= otherId)) {
            tok.id = tok.id - 1; // id renumbering
        };
    });
    return sent;
}


function mergeNodes(toMerge, side, how) {
    /* Support for merging tokens into either a new token or a supertoken.
    Recieves the node to merge, side (right or left) and a string denoting
    how to merge the nodes. In case of success, redraws the tree. */

    var indices = findConlluId(toMerge);
    var isSubtoken = indices[0];

    if (isSubtoken) {
        alert("Sorry, merging subtokens is not supported!");
        drawTree();
        return;
    }
    
    var nodeId = indices[1];
    var otherId = (side == "right") ? nodeId + 1 : nodeId - 1;
    var sent = buildSent();

    if (otherId >= 0 && sent.tokens[otherId]) {
        var main = toMerge.data("form");
        var other = sent.tokens[otherId].form;
        var newToken = (side == "right") ? main + other : other + main;
        if (how == "subtoken") {
            sent.tokens[nodeId].form = newToken; // rewrite the token
            sent.tokens.splice(otherId, 1); // remove the merged token
            sent = renumberNodes(nodeId, otherId, sent, side);
        } else if (how == "supertoken") {
            var min = Math.min(nodeId, otherId)
            var supertoken = new conllu.MultiwordToken();
            supertoken.tokens = sent.tokens.splice(min, 2);
            supertoken.form = newToken;
            sent.tokens.splice(min, 0, supertoken);
        };

        redrawTree(sent);
    } else {
        console.log("Probably wrong direction?");
    }
}


function buildSent() {
    /* Reads data from the textbox, returns a sent object. */
    var sent = new conllu.Sentence();
    var currentSent = $("#indata").val();
    var currentFormat = detectFormat(currentSent);
    if (currentFormat == "CG3") {
        currentSent = CG2conllu(currentSent);
        if (currentSent == undefined) {
            drawTree();
            return;
        }
    }
    sent.serial = currentSent;
    return sent;
}


function redrawTree(sent) {
    // Takes a Sentence object. Writes it to the textbox and calls
    // the function drawing the tree and updating the table
    var changedSent = sent.serial;

    // detecting which format was used
    var currentSent = $("#indata").val();
    var currentFormat = detectFormat(currentSent);
    if (currentFormat == "CG3") {
        changedSent = conllu2CG(changedSent);
    }

    $("#indata").val(changedSent);
    updateTable();
    drawTree(); 
    cy.zoom(CURRENT_ZOOM);
}


// refactoring the write functions. in project, is not used yet
function writeSent(makeChanges) {

    // build sent
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();

    sent = makeChanges(sent, this);

    // redraw tree
    $("#indata").val(sent.serial);
    drawTree();    
}


function viewAsPlain() { // TODO: DRY?
    var text = $("#indata").val();
    var currentFormat = detectFormat(text);

    if (currentFormat == "CoNLL-U") {
        text = conllu2plainSent(text);
    } else if (currentFormat == "CG3") {
        text = CG2conllu(text);
        if (text == undefined) {
            cantConvertCG(); // show the error message
            return;
        } else {
            text = conllu2plainSent(text);
        }
    }
    $("#indata").val(text);
}


function viewAsConllu() {
    var text = $("#indata").val();
    var currentFormat = detectFormat(text);

	if ($("#viewOther").text() == "plain text" || $("#viewOther").text() == "SD") {
		  toConllu();
	}	

    if (FORMAT == "plain text") {
        loadDataInIndex(); // TODO: this will certainly cause unexpected behavior. refactor when you have time.
    } else if (currentFormat == "CG3") {
        text = CG2conllu(text);
        if (text == undefined) {
            cantConvertCG();
            return;
        }
        $("#viewCG").removeClass("active");
        $("#viewConllu").addClass("active");
        $("#indata").val(text);
    }
}


function viewAsCG() {
    var text = $("#indata").val();
    var currentFormat = detectFormat(text);

    var text = $("#indata").val();
    if (currentFormat == "CoNLL-U") {
        text = conllu2CG(text);
        $("#viewConllu").removeClass("active");
    }
    $("#viewCG").addClass("active");
    $("#indata").val(text);

    if(TABLE_VIEW) {
        $("#tableViewButton").toggleClass('fa-code', 'fa-table');
        $("#indataTable").toggle();
        $("#indata").toggle();
        TABLE_VIEW = false ;
    }

}


function cantConvertCG() {
    document.getElementById("viewConllu").disabled = true;
    $("#warning").css("background-color", "pink")
        .text("Warning: CG containing ambiguous analyses can't be converted into CoNLL-U!");
}


function clearWarning() {
    document.getElementById("viewConllu").disabled = false;
    $("#warning").css("background-color", "white")
        .text("");
}


function switchRtlMode() {
	$('#RTL .fa').toggleClass('fa-align-right');
	$('#RTL .fa').toggleClass('fa-align-left');
	 if (LEFT_TO_RIGHT) {
        LEFT_TO_RIGHT = false;
    } else {
        LEFT_TO_RIGHT = true;
    }
    drawTree();
}


function switchAlignment() {
	$('#vertical .fa').toggleClass('fa-rotate-90');
    if (VERT_ALIGNMENT) {
        VERT_ALIGNMENT = false;
    } else {
        VERT_ALIGNMENT = true;
    }
    drawTree();
}

function switchEnhanced() {
    $('#enhanced .fa').toggleClass('fa-tree');
    $('#enhanced .fa').toggleClass('fa-magic');
    if (VIEW_ENHANCED) {
        VIEW_ENHANCED = false;
    } else {
        VIEW_ENHANCED = true;
    }
    drawTree();
}


$(document).ready(function(){
	$('#currentsen').keyup(function(e){
		if(e.keyCode == 13) {
			goToSenSent();
		} else if(e.keyCode == UP || e.keyCode == K) {
			prevSenSent();
		} else if(e.keyCode == DOWN || e.keyCode == J) {
			nextSenSent();
		} else if(e.keyCode == MINUS) {
			removeCurSent();
		} else if(e.keyCode == EQUALS ) {
			addSent();
		}
	});

	// solution based on https://stackoverflow.com/a/12444641/5181692
	var map = {}; // You could also use an array
	onkeydown = onkeyup = function(e){
		e = e || event; // to deal with IE
		map[e.key] = e.type == 'keydown';
		/* insert conditional here */
		if(map["Shift"] && map["PageDown"]){
			nextSenSent();
			map = [];
			map["Shift"] = true; // leave Shift so that another event can be fired
		}else if(map["Shift"] && map["PageUp"]){
			prevSenSent();
			map = [];
			map["Shift"] = true; // leave Shift so that another event can be fired
		}else if(map["Control"] && map["z"]) {
			undoManager.undo();
			updateUI();
		}else if(map["Control"] && map["y"] || map["Control"] && map["Shift"] && map["Z"]) {
			undoManager.redo();
			updateUI();
		}
		//return false;  // only needed if want to override all the shortcuts
	}

	//$('#helpModal').on('show.bs.modal', console.log);

	$('#helpModal').on('shown.bs.modal', function(e) {
		//alert('HARGLE BARGLE');
                $("#treebankSize").text(CONTENTS.length); // TODO: Report the current loaded treebank size to user
		$(e.target).find('.modal-body').load('help.html');
	});

//	$('.ui-autocomplete').keydown(function(e) {
//		if(e.keyCode == 9) { // Tab
//			console.log('test');
//		}
//	});

	$('#viewText').hide() ;

	// collapse columns when header is clicked on
	$('.thead-default th').on('click', function(e) {
		var columnHeader = $('.tableColHeader', this)[0];
		if (columnHeader) {  // prevents non-collapsible cols from throwing errors
			toggleTableColumn(columnHeader.title);
		}
	});
	// this way of doing it only responds when icon is clicked:
	//$('.tableColHeader').on('click', function(e) {
	//	toggleTableColumn(this.title);
	//});
});

