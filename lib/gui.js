"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";


// require lib for CoNLL-U parsing
var conllu = require("conllu");


function drawArcs() {
    /*
    Called when a node is clicked. Lightens the node and resets this handler
    to arcDest. If nothing happens, returns everything in its previous state.
    */
    var sourceNode = this;
    sourceNode.style.setProperty("fill", ACTIVE);
    sourceNode.setAttribute("state", "active");

    // resets the handlers
    var nodes = $("rect[data-span-id]");
    $.each(nodes, function(n, node){
        node.removeEventListener("click", drawArcs);
        node.addEventListener("click", arcDest);
    });

    // after 10 seconds, return everything to its previous state
    setTimeout(function(){
        return2Normal();
    }, 10000);
};


function arcDest() {
    /*
    Called when the destination node is clicked.
    CALLS FUNCTIONS FOR DATA TRANSFORMATION.
    Resets the handlers on nodes to the previous state.
    */

    var destNode = this;
    var sourceNode = $("rect[state=active]")[0];

    // change the colour to FANCY and after half a second return it to NORMAL
    destNode.style.setProperty("fill", FANCY);
    sourceNode.style.setProperty("fill", FANCY);
    setTimeout(function(){
        destNode.style.setProperty("fill", NORMAL);
        sourceNode.style.setProperty("fill", NORMAL);
    },
    500);

    // change data, redraw the tree
    writeArc(sourceNode, destNode);

    // executed if source index equals target index
    return2Normal();
};


function writeArc(sourceNode, destNode) {
    /*
    Called in arcDest. Makes changes to the text data and calls the function
    redrawing the tree. Currently supports only conllu.
    */
    var sourceIndex = sourceNode.getAttribute("index");
    var destIndex = destNode.getAttribute("index");

    // if source index equals target index, abort rewriting
    if (sourceIndex == destIndex) { return };

    // replace the old line of destNode with the one with HEAD
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();
    sent.tokens[destIndex].head = Number(sourceIndex) + 1;
    $("#indata").val(sent.serial);

    // redraw the tree
    keyUpFunc();
}


function return2Normal() {
    /* resets everything to normal state */
    var nodes = $("rect[data-span-id]");
    $.each(nodes, function(n, node){
        node.setAttribute("state", "normal");
        node.style.setProperty("fill", NORMAL);
        node.removeEventListener("click", arcDest);
        node.addEventListener("click", drawArcs);
    });
}


function plain2Conllu(text) {
    /* Takes plain text, returns a sentence in CoNLL-U format. */
    var sent = new conllu.Sentence();

    // creating comment
    var lines = ["# " + text];
    var tokens = text.split(" ");

    // enumerating tokens
    $.each(tokens, function(i, token) {tokens[i] = (i + 1) + "\t" + token});

    lines = lines.concat(tokens);
    sent.serial = lines.join("\n");
    return sent.serial;
}


function toConllu() {
    // var text = $("#indata").val();
    if (format == "plain text") {
        $("#indata").val(plain2Conllu($("#indata").val()));
    } else if (format == "CG3") {
        $("#indata").val(cgParse($("#indata").val()));
    }
    keyUpFunc();
}
