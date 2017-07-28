"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";
var DEL_KEY = 46;
var BACKSPACE = 8;
var D = 68;
var I = 73;

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
    Activated when an arc is selected. Changes style and activates arcKeyUp.
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

    $(document).keyup(arcKeyUp);
}


function arcKeyUp(key) {

    if (key.which == DEL_KEY) {
        removeArc();
    } else if (key.which == BACKSPACE) {
        drawTree();
    } else if (key.which == D) {
        moveArc();
    } else if (key.which == I) {
        editDeprel();
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