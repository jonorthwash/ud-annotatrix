"use strict"

// require lib for CoNLL-U parsing
var conllu = require("conllu");

function conlluDraw(content) {
    /* Draw the tree. */
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: true,
        autoungrabify: true,


        layout: {
            name: 'grid',
            condense: true,
            // cols: sent.tokens.length,
            rows: 2,
            sort: simpleIdSorting
        },

        style: CY_STYLE,
        elements: conllu2cy(content)
    });
}


function conllu2cy(content) {
    var sent = new conllu.Sentence();
    sent.serial = content;
    var graph = [];
    $.each(sent.tokens, function(n, token) {

        var nodeId = (String(token.id).length > 1) ? token.id : "0" + token.id;

        // creating token node
        var nodeWF = token;
        nodeWF.length = nodeWF.form.length + "em";
        nodeWF.id = "nf" + nodeId;
        nodeWF.state = "normal";
        graph.push({"data": nodeWF, "classes": "wf"});

        graph = makePOS(token, nodeId, graph);
        graph = makeDependencies(token, nodeId, graph);
    })

    return graph;
}


function makeDependencies(token, nodeId, graph) {
    /* if there is head, create an edge for dependency */

    if (token.head && token.head != 0) {
        var head = (String(token.head).length > 1) ? token.head : "0" + token.head;
        var edgeDep = {
            "id": "ed" + nodeId,
            "source": "nf" + head,
            "target": "nf" + nodeId,
            "label": token.deprel,
            "ctrl": [40, 40, 40, 40]
        }
        var coef = token.head - nodeId;
        // console.log("head: " + token.head + ", dep: " + nodeId + ", coef: " + coef);
        edgeDep.ctrl = edgeDep.ctrl.map(function(el){ return el*coef; });
        graph.push({"data": edgeDep, "classes": "dependency"});
    };
    return graph;
}


function makePOS(token, nodeId, graph) {
    /* Creates nodes for POS and edges between wf and POS nodes */

    var pos = "";
    if (token.upostag != undefined) {
        pos = token.upostag;
    } else if (token.xpostag != undefined) {
        pos = token.xpostag;
    };

    // creating pos node
    var nodePOS = {
        "id": "np" + nodeId,
        "pos": pos,
        "length": (pos.length + 1) + "em"
    }
    graph.push({"data": nodePOS, "classes": "pos"});

    // the edge from token to POS
    var edgePOS = {
        "id": "ep" + nodeId,
        "source": "nf" + nodeId,
        "target": nodePOS.id
    }
    graph.push({"data": edgePOS, "classes": "pos"});

    return graph;
}


function sortNodes(n1, n2) {
    // TODO?
}


function simpleIdSorting(n1, n2) {
    if( n1.id() < n2.id() ){
        return -1;
    } else if( n1.id() > n2.id() ){
        return 1;
    } else {
        return 0;
    }
}


// is defined in a js file, because fetch doesn't work offline in chrome
var CY_STYLE = [{
  "selector": "node",
  "style": {
    "height": 20,
    "width": "data(length)",
    "background-color": NORMAL,
    "shape": "roundrectangle",
    "text-valign": "center",
    "text-halign": "center",
    "border-color": "#000",
    "border-width": 1
  }
}, {
  "selector": "node.wf",
  "style": {
    "label": "data(form)"
  }
}, {
    "selector": "node.wf.arc-selected",
    "style": {
        "border-color": FANCY
    }
}, {
    "selector": "node.wf.activated",
    "style": {
        "background-color": ACTIVE
    }
}, {
  "selector": "node.pos",
  "style": {
    "label": "data(pos)",
    "background-color": POS_COLOR
  }
}, {
  "selector": "edge",
  "style": {
    "width": 3,
    "opacity": 0.766,
    "line-color": "#111"
  }
}, {
  "selector": "edge.dependency",
  "style": {
    "target-arrow-shape": "triangle",
    "target-arrow-color": "#111",
    "text-margin-y": -10,
    "curve-style": "unbundled-bezier",
    "control-point-distances": "data(ctrl)",
    "control-point-weights": "0 0.25 0.75 1",
    "edge-distances": "node-position",
    "label": "data(label)"
  }
}, {
    "selector": "edge.dependency.selected",
    "style": {
        "line-color": FANCY,
        "target-arrow-color": FANCY
    }
}, {"selector": "edge.pos",
  "style": {
    "curve-style": "haystack"
  }
}];


/* TODO:

var nodeWF = Object.create(token);
...
nodePOS = Object.create(token);
...

*/
