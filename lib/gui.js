"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";


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

    var text = getText();
    var comments = text[0];
    var content = text[1];

    // replace the old line of destNode with the one with HEAD
    content[destIndex] = addParent(content[destIndex], sourceIndex);
    var outText = comments.concat(content).join("\n");
    console.log(outText);
    $("#indata").val(outText);

    // redraw the tree
    keyUpFunc();
}


function getText() {
    /* 
    Gets the input text and separates comments from the tree.
    Returns an array with two arrays: comment lines and tree lines. 
    */
    var text = $("#indata").val();
    var comments = [];
    var content = [];

    //separate comments and the tree
    $.each(text.split("\n"), function(i, line){
        if (line[0] == "#"){
            comments.push(line);
        } else {
            content.push(line);
        };
    })

    return [comments, content];
}


function addParent(line, sourceIndex) {
    /* adds parent in source node to the target node */
    var token = new Token(line);
    token.head = Number(sourceIndex) + 1;
    line = token.rebuildLine();
    return line;
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