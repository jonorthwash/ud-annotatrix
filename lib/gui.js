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
    sourceNode.setAttribute("state", "active")

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
}


function arcDest() {
    /*
    Called when the destination node is clicked.
    CALLS FUNCTIONS FOR DATA TRANSFORMATION.
    Resets the handlers on nodes to the previous state.
    */

    var destNode = this;
    var sourceNode = $("rect[state=active]")[0]

    //
    var nodes = $("rect[data-span-id]");
    $.each(nodes, function(n, node){
        node.removeEventListener("click", arcDest);
        node.addEventListener("click", drawArcs);
    });

    // change the colour to FANCY and after 2 seconds, return it to NORMAL
    destNode.style.setProperty("fill", FANCY);
    sourceNode.style.setProperty("fill", FANCY);
    setTimeout(function(){
        destNode.style.setProperty("fill", NORMAL);
        sourceNode.style.setProperty("fill", NORMAL);
    },
    2000);
}
