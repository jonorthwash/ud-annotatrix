"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";
var DEL_KEY = 46;
var BACKSPACE = 8;


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
};


function arcDest() {
    /*
    Called when the destination node is clicked.
    Calls functions for data transformation.
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
    nodes2Normal();
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

    // convert data to conllu
    toConllu();

    // replace the old line of destNode with the one with HEAD
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();
    sent.tokens[destIndex].head = Number(sourceIndex) + 1;
    $("#indata").val(sent.serial);

    // redraw the tree
    keyUpFunc();
}


function nodes2Normal() {
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

    // punctuation
    // TODO: if there's punctuation in the middle of a sentence, indices shift 
    text = text.replace(/([^ ])([.?!;:,])/g, "$1 $2");

    var sent = new conllu.Sentence();
    var lines = ["# " + text]; // creating comment
    var tokens = text.split(" ");

    // enumerating tokens
    $.each(tokens, function(i, token) {tokens[i] = (i + 1) + "\t" + token});

    // TODO: automatical recognition of punctuation's POS
    lines = lines.concat(tokens);
    sent.serial = lines.join("\n");
    return sent.serial;
}


function toConllu() {
    /* Converts the input to CoNLL-U and redraws the tree */
    var text = $("#indata").val();
    if (FORMAT == "plain text") {
        $("#indata").val(plain2Conllu(text));
    } else if (FORMAT == "CG3") {
        // $("#indata").val(cgParse(text));
        alert("The option is not supported yet :( ");
    }
    keyUpFunc();
}


function selectArc() {
    /* 
    Activated when an arc is selected. Changes style and activates arcKeyUp.
    */

    // ugly piece of code for visual effects
    this.childNodes[0].style.setProperty("fill", FANCY);
    this.childNodes[1].setAttribute("marker-start", "");
    this.childNodes[1].setAttribute("marker-end", "");
    this.childNodes[1].style.setProperty("stroke", FANCY);
    this.childNodes[2].setAttribute("marker-start", "");
    this.childNodes[2].setAttribute("marker-end", "");
    this.childNodes[2].style.setProperty("stroke", FANCY);

    // getting info about nodes
    var sourceIndex = Number(this.getAttribute("data-from").split("-T")[1]);
    var destIndex = Number(this.getAttribute("data-to").split("-T")[1]);
    var nodes = $("rect[data-span-id]");

    // another ugly piece of code for visual effects
    nodes[sourceIndex - 1].style.setProperty("stroke", FANCY);
    nodes[destIndex - 1].style.setProperty("stroke", FANCY);

    // for identifying node
    nodes[destIndex - 1].setAttribute("state", "arc-del");

    $(document).keyup(arcKeyUp);

    // support for unselecting arcs. No, it wpuld be long and ugly. i'd rather wait till i rewrite everything.
    // this.removeEventListener("click", selectArc);
    // this.addEventListener("click", arc2Normal);
}


function arcKeyUp(key) {

    if (key.which == DEL_KEY) {
        removeArc();
    } else if (key.which == BACKSPACE) {
        keyUpFunc();
    }
}


function removeArc(argument) {
    /* Removes all the selected edges. */

    var destNodes = $("rect[state=arc-del]");
    var sent = new conllu.Sentence();
    sent.serial = $("#indata").val();

    // support for multiple arcs
    $.each(destNodes, function(i, node) {
        var destIndex = node.getAttribute("index");

        // remove the head and the deprel from destNode
        sent.tokens[destIndex].head = undefined;
        sent.tokens[destIndex].deprel = undefined;
    })

    // redraw the tree
    $("#indata").val(sent.serial);
    keyUpFunc();
}


// function arc2Normal() {
//     this.childNodes[0].style.setProperty("fill", "black");
//     this.childNodes[1].setAttribute("marker-start", "");
//     this.childNodes[1].setAttribute("marker-end", "");
//     this.childNodes[1].style.setProperty("stroke", "black");
//     this.childNodes[2].setAttribute("marker-start", "");
//     this.childNodes[2].setAttribute("marker-end", "");
//     this.childNodes[2].style.setProperty("stroke", "black");
// }