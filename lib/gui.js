"use strict"

/*
This scripts contains makes support for graphical editing.
*/

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff"
var FANCY = "#549666"

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

    // after 10 seconds, return everything in its previous state
    setTimeout(function(){
        sourceNode.style.setProperty("fill", NORMAL);
        $.each(nodes, function(n, node){
            node.removeEventListener("click", arcDest);
            node.addEventListener("click", drawArcs);
        });
    },
    10000);
};


function arcDest() {
    /*
    Called when the destination node is clicked.
    CALLS FUNCTIONS FOR DATA TRANSFORMATION.
    Resets the handlers on nodes to the previous state.
    */

    var destNode = this;
    var sourceNode = $("rect[state=active]")[0];

    // change the colour to FANCY and after a second return it to NORMAL
    destNode.style.setProperty("fill", FANCY);
    sourceNode.style.setProperty("fill", FANCY);
    setTimeout(function(){
        destNode.style.setProperty("fill", NORMAL);
        sourceNode.style.setProperty("fill", NORMAL);
    },
    1000);

    // change data, redraw the tree
    writeArc(sourceNode, destNode);

    // resets everything to normal state
    sourceNode.setAttribute("state", "normal");
    var nodes = $("rect[data-span-id]");
    $.each(nodes, function(n, node){
        node.removeEventListener("click", arcDest);
        node.addEventListener("click", drawArcs);
    });
};


function writeArc(sourceNode, destNode) {
    /*
    Called in arcDest. Makes changes to the text data and calls the function
    redrawing the tree. Currently supports only conllu.
    */
    var sourceIndex = sourceNode.getAttribute("index");
    var destIndex = destNode.getAttribute("index");
    alert("source: " + (+sourceIndex + 1) + "\ndest: " + (+destIndex + 1));

    var text = getText();
    var comments = text[0];
    var content = text[1];

    var line2modify = content[destIndex];
    alert(line2modify);

    line2modify = addParent(line2modify);
    alert(line2modify);
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
            comments.push(line)
        } else {
            content.push(line)
        };
    })

    return [comments, content]
}

function addParent(line) {
    line = line.split("\t");
    console.log(line);
}