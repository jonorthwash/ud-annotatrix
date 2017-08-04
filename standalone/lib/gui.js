"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";
var POS_COLOR = "#afa2ff";
var DEL_KEY = 46;
var BACKSPACE = 8;
var ENTER = 13;
var D = 68;
var I = 73;
var T = 84;

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
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();
    sent.tokens[destIndex - 1].head = Number(sourceIndex);
    $("#indata").val(sent.serial);

    // redraw the tree
    drawTree();
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
    // looking if some wf node is selected
    var wf = cy.$("node.wf.activated");
    // looking for a node to be tokenised
    var toBretokenized = cy.$("node.wf.activated.retokenize");

    if (selArcs.length) {
        console.log('selected');
        if (key.which == DEL_KEY) {
            removeArc();
        } else if (key.which == BACKSPACE) {
            drawTree();
        } else if (key.which == D) {
            moveArc();
        } else if (key.which == I) {
            editDeprel();
        }
    } else if (posInp.length) {
        if (key.which == ENTER) {
            writePOS(posInp);
        }
    } else if (wfInp.length) {
        if (key.which == ENTER) {
            writeWF(wfInp);
        }
    } else if (toBretokenized.length == 1) {
        retokenize(key); // developing, not ready yet
    } else if (wf.length == 1) {
        if (key.which == T) {
            wf.addClass("retokenize");
        }
    }

}


function removeArc(argument) {
    /* Removes all the selected edges. */

    var destNodes = cy.$("node[state='arc-dest']");
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();

    // support for multiple arcs
    $.each(destNodes, function(i, node) {
        var destIndex = node.id().slice(2);

        // remove the head and the deprel from destNode
        sent.tokens[destIndex - 1].head = undefined;
        sent.tokens[destIndex - 1].deprel = undefined;
    })

    // redraw the tree
    $("#indata").val(sent.serial);
    drawTree();
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
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();

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
    $("#indata").val(sent.serial);
    drawTree();   
}


function changeInp() {

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
    }

    this.addClass("input");
    var x = this.renderedPosition("x");
    var y = this.relativePosition("y");
    var width = this.renderedWidth();
    var height = this.renderedHeight();

    // TODO: font size
    $("#mute").addClass("activated");
    console.log($(selector));
    $(selector).css("display", "inline")
        .css("bottom", y - parseInt(height*0.55))
        .css("left", x - parseInt(width/2)*1.1)
        .css("height", height)
        .css("width", width)
        .css("border", "2px solid black")
        .css("background-color", color)
        .css("color", "black")
        .attr("value", this.data(label))
        .addClass("activated");

    $(selector).focus();
}


function writePOS(posInp) {
    var activeNode = cy.$(".input");
    var nodeId = activeNode.id().slice(2) - 1;

    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();
    sent.tokens[nodeId].upostag = posInp.val(); // TODO: think about xpostag changing support
    $("#indata").val(sent.serial);

    drawTree();
}


function writeWF(wfInp) {
    var activeNode = cy.$(".input");
    var nodeId = activeNode.id().slice(2) - 1;

    var newToken = wfInp.val();
    if (newToken.includes(" ")) {
        console.log("going to retokenize it");
    } else {

        // TODO: this almost copies writePOS. DRY.
        var sent = new conllu.Sentence();
        sent.serial = $("#indata").val();
        sent.tokens[nodeId].form = wfInp.val();
        $("#indata").val(sent.serial);

        drawTree();
    }
}


function changeTokenization() {
    // body...
}


function retokenize(key) {
    var sym = String.fromCharCode(key.keyCode);
    console.log(sym);

    var node = cy.$(".retokenize");
    var form = node.data("form");

    if (form.includes(sym)) {
        console.log("YEAH!");
    }

    console.log("key: " + key.keyCode);
}
