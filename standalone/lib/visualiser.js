"use strict"

var ACTIVE = "#2653c9";
var NORMAL = "#7fa2ff";
var FANCY = "#cc22fc";
var POS_COLOR = "#afa2ff";
var ST_COLOR = "#bcd2ff"

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
        if (token.tokens){
            var spId = "ns" + strWithZero(n);
            graph.push({"data": {"id": spId, "form": token.form}});
            $.each(token.tokens, function(n, subTok) {
                graph = createToken(graph, subTok, spId);
            });
        } else {
            graph = createToken(graph, token);
        }
    })

    return graph;
}


function createToken(graph, token, spId) {
    /* Takes the tree graph, a token object and the id of the supertoken.
    Creates the wf node, the POS node and dependencies. Returns the graph. */

    // handling empty form
    if (token.form == undefined && spId) {token.form = token.lemma};
    if (token.form == undefined) {token.form = " "};

    var nodeId = strWithZero(token.id);
    var nodeWF = token;

    nodeWF.parent = spId;
    nodeWF.length = nodeWF.form.length + "em";
    nodeWF.id = "nf" + nodeId;
    nodeWF.label = nodeWF.form;
    nodeWF.state = "normal";
    graph.push({"data": nodeWF, "classes": "wf"});

    graph = makePOS(token, nodeId, graph);
    graph = makeDependencies(token, nodeId, graph);
    return graph;
}


function makeDependencies(token, nodeId, graph) {
    /* if there is head, create an edge for dependency */

    if (token.head && token.head != 0) {
        var head = strWithZero(token.head);
        var edgeDep = {
            "id": "ed" + nodeId,
            "source": "nf" + head,
            "target": "nf" + nodeId,
            "label": token.deprel,
            "ctrl": [55, 55, 55, 55]
        }
        var coef = (token.head - nodeId);
        if (Math.abs(coef) != 1) {coef *= 0.7};
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
        "label": pos,
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


function strWithZero(num) {
    return (String(num).length > 1) ? "" + num : "0" + num;
}


/* TODO:

var nodeWF = Object.create(token);
...
nodePOS = Object.create(token);
...

*/
