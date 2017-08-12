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
var T = 84;
var S = 83;
var M = 77;

function drawArcs(evt) {
    /* Called when a node is clicked. */

    // if the user clicked an activated node
    if (this.hasClass("activated")) {
        this.removeClass("activated");
        this.removeClass("retokenize");
    } else {
        // look for other activated nodes
        var actNode = cy.$(".activated");

        this.addClass("activated");
        
        // if there is an activated node already
        if (actNode.length == 1) {
            writeArc(actNode, this);
        }
    }
}


function writeArc(sourceNode, destNode) {
    /*
    Called in arcDest. Makes changes to the text data and calls the function
    redrawing the tree. Currently supports only conllu.
    */

    var sourceIndex = Number(sourceNode.data("id").slice(2)); // TODO: more beautiful way
    var destIndex = Number(destNode.data("id").slice(2));

    // if source index equals target index, abort rewriting
    if (sourceIndex == destIndex) { return };

    // convert data to conllu
    toConllu();

    // replace the old line of destNode with the one with HEAD
    var sent = buildSent();
    sent.tokens[destIndex - 1].head = Number(sourceIndex);
    redrawTree(sent);
}


function selectArc() {
    /* 
    Activated when an arc is selected. Adds classes showing what is selected.
    */

    // if the user clicked an activated node
    if (this.hasClass("selected")) {
        this.removeClass("selected");

        // removing visual effects for destNode
        var destNodeId = this.data("target");
        cy.$("#" + destNodeId).removeClass("arc-selected");

    } else {
        this.addClass("selected");

        // getting info about nodes
        var destNodeId = this.data("target");

        // visual effects for destNode
        cy.$("#" + destNodeId).addClass("arc-selected");
    }

    // for identifying the node
    cy.$("#" + destNodeId).data("state", "arc-dest");
}


function keyUpClassifier(key) {

    // looking if there are selected arcs
    var selArcs = cy.$("edge.dependency.selected");
    // looking if there is a POS label to be modified
    var posInp = $(".activated#pos");
    // looking if there is a wf label to be modified
    var wfInp = $(".activated#wf");
    // looking if there is a deprel label to be modified
    var deprelInp = $(".activated#deprel");
    // looking if some wf node is selected
    var wf = cy.$("node.wf.activated");
    // looking for a node to be tokenised
    var toBretokenized = cy.$("node.wf.activated.retokenize");
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
            writePOS(posInp);
        };
    } else if (wfInp.length) {
        if (key.which == ENTER) {
            writeWF(wfInp);
        };
    } else if (deprelInp.length) {
        if (key.which == ENTER) {
            writeDeprel(deprelInp);
        };
    } else if (toBretokenized.length == 1) {
        retokenize(key); // is not used now
    } else if (wf.length == 1) {
        if (key.which == T) {
            wf.addClass("retokenize"); // is not used now
        } else if (key.which == M) {
            wf.addClass("merge");
            wf.removeClass("activated");
        } else if (key.which == S) {
            wf.addClass("supertoken");
            wf.removeClass("activated");
        };
    } else if (toMerge.length) {
        if (key.which == RIGHT) {
            mergeTokens(toMerge, "right");
        } else if (key.which == LEFT) {
            mergeTokens(toMerge, "left");
        };
    } else if (toSup.length) {
        if (key.which == RIGHT) {
            mergeSupertoken(toSup, "right");
        } else if (key.which == LEFT) {
            mergeSupertoken(toSup, "left");
        };
    }
    console.log(key.which);

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


function changeInp() {

    this.addClass("input");
    var x = this.renderedPosition("x");
    var y = this.relativePosition("y");
    var width = this.renderedWidth();
    var height = this.renderedHeight();

    var selector, color, label;

    // defining which part of the tree needs to be changed
    if (this.hasClass("pos")) {
        selector = "#pos";
        color = POS_COLOR;
        label = "pos";
    } else if (this.hasClass("wf")) {
        selector = "#wf";
        color = NORMAL;
        label = "form";
        y = this.renderedPosition("y");
        console.log("y: " + y);
        y = y*0.4;
    } else if (this.hasClass("dependency")) {
        selector = "#deprel";
        color = "white";
        label = "label";
        var coord = findEdgesPos(this);
        x = coord[0];
        y = coord[1];
        width = 100; // TODO: make a subtlier sizing
        height = 40;
    };


    // TODO: font size
    $("#mute").addClass("activated");
    $(selector).css("bottom", y - parseInt(height*0.55))
        .css("left", x - parseInt(width/2)*1.1)
        .css("height", height)
        .css("width", width)
        .css("background-color", color)
        .attr("value", this.data(label))
        .addClass("activated");

    $(selector).focus();
}


function findEdgesPos(edge) {
    var sourceNode = edge.data("source");
    var sourceX = cy.$("#" + sourceNode).renderedPosition("x");
    var sourceY = cy.$("#" + sourceNode).renderedPosition("y");
    var destNode = edge.data("target");
    var destX = cy.$("#" + destNode).renderedPosition("x");
    var lift = Math.abs(edge.data("ctrl")[0]);
    var dist = sourceX - destX;
    var y = sourceY;
    var x = sourceX - dist/2;
    return [x, y];
}


function find2change() {
    /* Selects a cy element which is to be changed, returns its index. */
    var active = cy.$(".input");
    var Id = active.id().slice(2) - 1;
    return Id;
}


function writeDeprel(deprelInp) {
    /* Writes changes to deprel label. */
    var edgeId = find2change();
    var sent = buildSent();
    sent.tokens[edgeId].deprel = deprelInp.val();
    redrawTree(sent);
}


function writePOS(posInp) {
    /* Writes changes to POS label. */
    var nodeId = find2change();
    var sent = buildSent();
    sent.tokens[nodeId].upostag = posInp.val(); // TODO: think about xpostag changing support
    redrawTree(sent);
}


function writeWF(wfInp) {
    /* Either writes changes to token or retokenises the sentence. */
    var nodeId = find2change();
    var newToken = wfInp.val();

    if (newToken.includes(" ")) {
        changeTokenization(newToken, nodeId);
    } else {

        // TODO: this almost copies writePOS. DRY.
        var sent = buildSent();
        sent.tokens[nodeId].form = wfInp.val();
        redrawTree(sent);
    }
}


function changeTokenization(oldToken, nodeId) {
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


function mergeSupertoken(toSup, side) { // TODO: dry with mergeTokens
    var nodeId = Number(toSup.id().slice(2)) - 1;
    var sent = buildSent();
    var otherId = (side == "right") ? nodeId + 1 : nodeId - 1;
    var min = Math.min(nodeId, otherId);
    if (otherId >= 0 && sent.tokens[otherId]) {
        var supertoken = new conllu.MultiwordToken();

        var main = toSup.data("form");
        var other = sent.tokens[otherId].form;
        var newToken = (side == "right") ? main + other : other + main;
        console.log("Can merge: " + newToken);

        // rewrite the token
        supertoken.tokens = sent.tokens.splice(min, 2);
        supertoken.form = newToken;
        sent.tokens.splice(min, 0, supertoken);


        $.each(sent.tokens, function(n, tok){
            if ((side == "right" && tok.head > nodeId + 1)
                || (side == "left" && tok.head > otherId)){
                tok.head = +tok.head - 1; // head correction after indices shift
            };
            if ((side == "right" && n > nodeId)
                || (side == "left" && n >= otherId)) {
                tok.id = tok.id - 1; // renumbering
            };
        });

        redrawTree(sent);
    } else {
        console.log("Probably wrong direction?");
    };
}


function mergeTokens(toMerge, side) {
    var nodeId = Number(toMerge.id().slice(2)) - 1;
    var sent = buildSent();
    var otherId = (side == "right") ? nodeId + 1 : nodeId - 1;

    if (otherId >= 0 && sent.tokens[otherId]) {
        var main = toMerge.data("form");
        var other = sent.tokens[otherId].form;
        var newToken = (side == "right") ? main + other : other + main;
        console.log("Can merge: " + newToken);

        // rewrite the token
        sent.tokens[nodeId].form = newToken;

        // remove the merged token
        sent.tokens.splice(otherId, 1);

        $.each(sent.tokens, function(n, tok){
            if ((side == "right" && tok.head > nodeId + 1)
                || (side == "left" && tok.head > otherId)){
                tok.head = +tok.head - 1; // head correction after indices shift
            };
            if ((side == "right" && n > nodeId)
                || (side == "left" && n >= otherId)) {
                tok.id = tok.id - 1; // renumbering
            };
        });

        redrawTree(sent);
    } else {
        console.log("Probably wrong direction?");
    };
};


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


function retokenize(key) {
    /* Dead now. x_x */

    var sym = String.fromCharCode(key.keyCode);
    console.log(sym);

    var node = cy.$(".retokenize");
    var form = node.data("form");

    if (form.includes(sym)) {
        console.log("YEAH!");
    }

    console.log("key: " + key.keyCode);
}
