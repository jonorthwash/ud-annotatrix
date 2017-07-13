"use strict"

// require lib for CoNLL-U parsing
var conllu = require("conllu");

function conlluDraw(content) {
  Promise.all([
    fetch('./lib/cytoscape/cy-style.json', {mode: 'no-cors'})
      .then(function(res) {
        return res.json()
      })
  ])
    .then(function(dataArray) {
      
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
          sort: function( a, b ){
            if( a.id() < b.id() ){
              return -1;
            } else if( a.id() > b.id() ){
              return 1;
            } else {
              return 0;
            }
          }
        },

        style: dataArray[0],

        elements: conllu2cy(content)
      });
      cy.on('mousedown', 'node', function(evt){
        var node = evt.target;
        console.log( 'tapped ' + node.id() );
      });
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
        graph.push({"data": nodeWF, "classes": "wf"});

        // creating pos node
        var pos = (token.upostag != undefined) ? token.upostag : token.xpostag;
        var nodePOS = {
            "id": "np" + nodeId,
            "pos": pos,
            "length": (pos.length + 1) + "em"
        }
        graph.push({"data": nodePOS, "classes": "pos"});

        // the edge from token to POS
        var edgePOS = {
            "id": "ep" + nodeId,
            "source": nodeWF.id,
            "target": nodePOS.id
        }
        graph.push({"data": edgePOS, "classes": "pos"});

        // if there is head, create an edge for dependency
        if (token.head && token.head != 0) {
        	var head = (String(token.head).length > 1) ? token.head : "0" + token.head;
            var edgeDep = {
                "id": "ed" + nodeId,
                "source": "nf" + head,
                "target": nodeWF.id,
                "label": token.deprel,
                "ctrl": [40, 40, 40, 40]
            }
            var coef = token.head - nodeId;
		    console.log("head: " + token.head + ", dep: " + nodeId + ", coef: " + coef);
            edgeDep.ctrl = edgeDep.ctrl.map(function(el){ return el*coef; });
            graph.push({"data": edgeDep, "classes": "dependency"});
        }
    })

    return graph;
}


function sortNodes(n1, n2) {
	// TODO?
}

/* TODO:

var nodeWF = Object.create(token);
...
nodePOS = Object.create(token);
...

*/

// is defined in a js file, because fetch doesn't work offline in chrome
var CY_STYLE = [{
  "selector": "node",
  "style": {
    "height": 20,
    "width": "data(length)",
    "background-color": "#7fa2ff",
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
  "selector": "node.pos",
  "style": {
    "label": "data(pos)",
    "background-color": "#afa2ff"
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
}, {"selector": "edge.pos",
  "style": {
    "curve-style": "haystack"
  }
}];