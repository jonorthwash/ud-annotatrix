"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var DEL_KEY = 46;
var BACKSPACE = 8;
var ENTER = 13;
var RIGHT = 39;
var LEFT = 37;
var D = 68;
var I = 73;
var S = 83;
var M = 77;
var SIDES = {39: "right", 37: "left"};


function setUndos(undoManager) {
    btnUndo = document.getElementById("btnUndo");
    btnRedo = document.getElementById("btnRedo");

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
    Called in arcDest. Makes changes to the text data and calls the function
    redrawing the tree. Currently supports only conllu.
    */

    var sourceIndex = +sourceNode.data("id").slice(2);
    var destIndex = +destNode.data("id").slice(2);
    var sent = buildSent(); // add HEAD to destNode
    var prevHead = sent.tokens[destIndex - 1].head;
    sent.tokens[destIndex - 1].head = sourceIndex;
    redrawTree(sent);

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            sent.tokens[destIndex - 1].head = prevHead;
            redrawTree(sent);
        },
        redo: function(){
            writeArc(sourceNode, destNode);
        }
    });
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
    var selArcs = cy.$("edge.dependency.selected");
    // looking if there is a POS label to be modified
    var posInp = $(".activated.np");
    // looking if there is a wf label to be modified
    var wfInp = $(".activated.nf");
    // looking if there is a deprel label to be modified
    var deprelInp = $(".activated.ed");
    // looking if some wf node is selected
    var wf = cy.$("node.wf.activated");
    // looking if a supertoken node is selected
    var st = cy.$(".supAct"); // probably needs debugging
    // looking if some node waits to be merged
    var toMerge = cy.$(".merge");
    // looking if some node waits to be merged to supertoken
    var toSup = cy.$(".supertoken");


    if (selArcs.length) {
        if (key.which == DEL_KEY) {
            removeArc();
        } else if (key.which == BACKSPACE) {
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
            writeDeprel(deprelInp);
        };
    } else if (wf.length == 1) {
        if (key.which == M) {
            wf.addClass("merge");
            wf.removeClass("activated");
        } else if (key.which == S) {
            wf.addClass("supertoken");
            wf.removeClass("activated");
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
        if (key.which == DEL_KEY) {
            removeSup(st);
        }
    }
    // console.log(key.which);

}


function removeArc(argument) {
    /* Removes all the selected edges. */

    var destNodes = cy.$("node[state='arc-dest']");
    var sent = buildSent();

    // support for multiple arcs
    $.each(destNodes, function(i, node) {
        var destIndex = node.id().slice(2);

        // remove the head and the deprel from destNode
        sent.tokens[destIndex - 1].head = undefined;
        sent.tokens[destIndex - 1].deprel = undefined;
    })

    redrawTree(sent);
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


function editDeprel() {
    // building the CoNLL-U sent
    var sent = buildSent();

    // getting the deprel and the head
    // var actNode = cy.$(".activated");

    var destNode = cy.$(".arc-selected");
    console.log(destNode);
    var destIndex = destNode.id().slice(2);
    var deprel = sent.tokens[destIndex].deprel;
    console.log("deprel: " + deprel);

    // getting the new deprel
    var deprel = prompt("dependency relation:", deprel);
    sent.tokens[destIndex].deprel = deprel;

    // rewriting the tree
    redrawTree(sent);   
}


function removeSup(st) {
    /* Support for removing supertokens. */
    var sent = buildSent();
    var id = st.id().slice(2) - 1;
    var supIds = [];
    $.each(sent.tokens, function(n, tok) {
        if (tok.tokens) {supIds.push(n)};
    });

    var subTokens = sent.tokens[supIds[id]].tokens;
    sent.tokens.splice(supIds[id], 1);

    // is there really no more beautiful way?..
    $.each(subTokens, function(n, tok) {
        sent.tokens.splice(supIds[id], 0, tok);
    });
    redrawTree(sent);
}


function changeNode() {
    this.addClass("input");
    var id = this.id().slice(0, 2);
    var param = this.renderedBoundingBox();
    param.color = this.style("background-color");
    if (id == "ed") {param = changeEdgeParam(param)};

    // for some reason, there are problems with label in deprels without this 
    if (this.data("label") == undefined) {this.data("label", "")};

    $("#mute").addClass("activated");
    $("#edit").css("top", param.y1)
        .css("left", param.x1)
        .css("height", param.h)
        .css("width", param.w)
        .css("background-color", param.color)
        .attr("value", this.data("label"))
        .addClass("activated")
        .addClass(id);

    $("#edit").focus();
}


function changeEdgeParam(param) {
    var nodeBox = cy.nodes()[0].renderedBoundingBox();
    param.w = nodeBox.w;
    param.h = nodeBox.h;
    param.x1 = param.x1 + (param.x2 - param.x1)/2 - param.w*0.5;
    param.color = "white";
    return param;
}


function find2change() {
    /* Selects a cy element to be changed, returns its index. */
    var active = cy.$(".input");
    var Id = active.id().slice(2) - 1;
    return Id;
}


function writeDeprel(deprelInp) { // TODO: DRY
    /* Writes changes to deprel label. */
    var edgeId = find2change();
    var sent = buildSent();
    var prevDeprel = sent.tokens[edgeId].deprel;
    sent.tokens[edgeId].deprel = deprelInp.val();
    redrawTree(sent);

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            sent.tokens[edgeId].upostag = prevPOS;
            redrawTree(sent);
        },
        redo: function(){
            writePOS(posInp, nodeId);
        }
    });
}


function writePOS(posInp, nodeId) {
    /* Writes changes to POS label. */
    var nodeId = (nodeId != undefined) ? nodeId : find2change();
    var sent = buildSent();
    var prevPOS = sent.tokens[nodeId].upostag;
    sent.tokens[nodeId].upostag = posInp; // TODO: think about xpostag changing support
    redrawTree(sent);

    window.undoManager.add({
        undo: function(){
            var sent = buildSent();
            sent.tokens[nodeId].upostag = prevPOS;
            redrawTree(sent);
        },
        redo: function(){
            writePOS(posInp, nodeId);
        }
    });
}


function writeWF(wfInp) {
    /* Either writes changes to token or retokenises the sentence. */
    var nodeId = find2change();
    var newToken = wfInp.val();

    if (newToken.includes(" ")) {
        splitTokens(newToken, nodeId);
    } else {

        // TODO: this almost copies writePOS. DRY.
        var sent = buildSent();
        sent.tokens[nodeId].form = wfInp.val();
        redrawTree(sent);
    }
}


function splitTokens(oldToken, nodeId) {
    /* Takes a token to retokenize with space in it and the Id of the token.
    Creates the new tokens, makes indices and head shifting, redraws the tree.
    All the attributes default to belong to the first part. */

    var newTokens = oldToken.split(" ");
    var sent = buildSent();

    // changing the first part
    sent.tokens[nodeId].form = newTokens[0];

    // creating inserting the second part
    var restTok = formNewToken({"id": nodeId + 1, "form": newTokens[1]});
    sent.tokens.splice(nodeId + 1, 0, restTok);

    $.each(sent.tokens, function(n, tok){
        if (tok.head > nodeId + 1){
            tok.head = +tok.head + 1; // head correction after indices shift
        };
        if (n > nodeId) {
            tok.id = tok.id + 1; // renumbering
        };
    });

    redrawTree(sent);
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
    
    var nodeId = Number(toMerge.id().slice(2)) - 1;
    var sent = buildSent();
    var otherId = (side == "right") ? nodeId + 1 : nodeId - 1;

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


function formNewToken(attrs) {
    /* Takes a dictionary of attributes. Creates a new token, assigns
    values to the attributes given. Returns the new token. */

    var newToken = new conllu.Token();
    $.each(attrs, function(attr, val){
        newToken[attr] = val;
    });
    return newToken;
}


function buildSent() {
    /* Reads data from the textbox, returns a sent object. */
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();
    return sent;
}


function redrawTree(sent) {
    /* Takes a Sentence object. Writes it to the textbox and calls
    the function drawing the tree. */
    $("#indata").val(sent.serial);
    drawTree(); 
}
