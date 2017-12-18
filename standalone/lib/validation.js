"use strict"

var U_DEPRELS = ["acl", "advcl", "advmod", "amod", "appos", "aux", "case", "cc", "ccomp", "clf", "compound", "conj", "cop", "csubj", "dep", "det", "discourse", "dislocated", "expl", "fixed", "flat", "goeswith", "iobj", "list", "mark", "nmod", "nsubj", "nummod", "obj", "obl", "orphan", "parataxis", "punct", "reparandum", "root", "vocative", "xcomp"];
var U_POS = ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X"];

// TODO: Make this more clever, e.g. CCONJ can have a dependent in certain 
// circumstances, e.g. and / or 
var U_POS_LEAF = ["ADP", "AUX", "CCONJ", "PART", "PUNCT", "SCONJ"];

function is_upos(s) {
    // Checks if a relation is in the list of valid parts of speech
    // @s = the input relation
    // returns a tuple of [bool, message]
    for(var i = 0; i < U_POS.length; i++) {
      if(U_POS[i] == s) { 
        return [true, "", {}];
      }
    }
    return [false, "err_upos_invalid", {"tag": s}];    
}


function is_udeprel(s) {
    // Checks if a relation is in the list of valid relations
    // @s = the input relation
    // returns a tuple of [bool, message]
    var s_deprel = s;
    // Language specific relations are a universal relation + : + some string
    if(s.search(":") >= 0) {
      s_deprel = s.split(":")[0];
    }
    // Check if the deprel is in the list of valid relations
    for(var i = 0; i < U_DEPRELS.length; i++) {
      if(U_DEPRELS[i] == s_deprel) { 
        return [true, "", {}];
      }
    }
    return [false, "err_udeprel_invalid", {"label": s}];
}

function is_leaf(s) {
    // Checks if a node is in the list of part-of-speech tags which 
    // are usually leaf nodes
    // @s = part of speech tag

    // http://universaldependencies.org/u/dep/punct.html
    // Tokens with the relation punct always attach to content words (except in cases of ellipsis) and can never have dependents.

    for(var i = 0; i < U_POS_LEAF.length; i++) {
      if(U_POS_LEAF[i] == s) { 
        return [true, "", {}];
      }
    }
    return [false, "err_udep_leaf_node", {"tag": s}];  

}


function is_projective_nodes(tree, nodeSet) {
    // Checks to see if a particular dependent has a non-projective head
   console.log('is_projective_nodes()', tree) ;
   console.log('is_projective_nodes()', nodeSet) ;
    var nodes = [];
    var heads = {};
    for(let node in tree) {
        if(!tree[node] || tree[node] == undefined) { 
            continue;
        }
        var head = tree[node].head;
        var id = tree[node].id;
        if(!head || !id) { 
            continue;
        }
        heads[id] = head;
        nodes.push(id);
    }

    console.log('is_projective()','heads', heads);
    console.log('is_projective()','nodes', nodes);

    var res = true;
    
    for(let i in nodeSet) {          // i here is the index of the node in nodeSet e.g. i = 0, nodeSet = [9]
        var n_i =  nodeSet[i];
        for(let j in nodes) {
            var n_j =  nodes[j];
            console.log('i:',nodes[n_i],'j:',nodes[j],'h(i):',heads[n_i],'h(j):',heads[n_j]);
            if((nodes[j] > nodes[n_i]) && (nodes[j] < heads[n_i])) { 
                if((heads[n_j] > heads[n_i]) || (heads[n_j] < nodes[n_i])) {
                    res = false;
                    console.log('[0] is_projective()',res);
                    return res;
                }
            }
            if((nodes[j] > heads[n_i]) && (nodes[j] < nodes[n_i])) {
                if((heads[n_j] > nodes[n_i]) || (heads[n_j] < heads[n_i])) {
                    res = false;
                    console.log('[1] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > nodes[n_i] && heads[n_j] < heads[n_i]) {
                if(nodes[j] < nodes[n_i] || nodes[j] > heads[n_i]) {
                    res = false;
                    console.log('[2] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > heads[n_i] && heads[n_j] < nodes[n_i]) {
                if(nodes[j] > nodes[n_i] || nodes[j] < heads[n_i]) {
                    res = false;
                    console.log('[3] is_projective()',res);
                    return res;
                }
            }
        }
    }
//    console.log('is_projective()', res);
    
    return res;
}



function is_projective(tree) {
    // Checks to see if a graph is projective 
    var nodes = [];
    var heads = {};
    for(let node in tree) {
        if(!tree[node] || tree[node] == undefined) { 
            continue;
        }
        var head = tree[node].head;
        var id = tree[node].id;
        if(!head || !id) { 
            continue;
        }
        head = parseInt(head);
        id = parseInt(id.slice(2));
        heads[id] = head;
        nodes.push(id);
    }

//    console.log('is_projective()','heads', heads);
//    console.log('is_projective()','nodes', nodes);

    var res = true;
    
    for(let i in nodes) {
        var n_i =  nodes[i];
        for(let j in nodes) {
            var n_j =  nodes[j];
            //console.log('i:',nodes[i],'j:',nodes[j],'h(i):',heads[n_i],'h(j):',heads[n_j]);
            if((nodes[j] > nodes[i]) && (nodes[j] < heads[n_i])) { 
                if((heads[n_j] > heads[n_i]) || (heads[n_j] < nodes[i])) {
                    res = false;
                    console.log('[0] is_projective()',res);
                    return res;
                }
            }
            if((nodes[j] > heads[n_i]) && (nodes[j] < nodes[i])) {
                if((heads[n_j] > nodes[i]) || (heads[n_j] < heads[n_i])) {
                    res = false;
                    console.log('[1] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > nodes[i] && heads[n_j] < heads[n_i]) {
                if(nodes[j] < nodes[i] || nodes[j] > heads[n_i]) {
                    res = false;
                    console.log('[2] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > heads[n_i] && heads[n_j] < nodes[i]) {
                if(nodes[j] > nodes[i] || nodes[j] < heads[n_i]) {
                    res = false;
                    console.log('[3] is_projective()',res);
                    return res;
                }
            }
        }
    }
//    console.log('is_projective()', res);
    
    return res;
}

function dfs(tree, i, visited) { 
    console.log('DFS: tree |',tree);
    console.log('DFS: i    |',i);
    console.log('DFS: visit|',visited);
    if(!(i in visited)) {
        visited[i] = 0;
    }
    visited[i] += 1;
    for(let child in tree[i]) {
        dfs(tree, child, visited);
    } 
}

function is_cyclic(tree) {
    // Checks if a given tree is cyclic 
    // Questions: (1) do we want to deal with partial trees ? 
    // @tree = input tree
    //console.log('is_cyclic() ' + tree);

    // Let's do a DFS for each of the valid nodes in the tree,
    var nodes = [];
    for(let node in tree) {
        if(!tree[node] || tree[node] == undefined) { 
            continue;
        }
        var head = tree[node].head;
        var id = tree[node].id;
        if(!head || !id) { 
            continue;
        }
        head = parseInt(head);
        id = parseInt(id.slice(2));
        if(!(head in nodes)) {
            nodes[head] = [];
        }
        nodes[head].push(id);
    }

    var cyclic = false;

    for(let node in nodes){ 
        var visited = {};
//        dfs(nodes, node, visited);
    }

    return [cyclic, "", {}];
}

function is_depend_cycles(tree) {
    var g = new Map();
    var vertices;
    var data = tree;
    vertices = Object.keys(data).length + 1;
    var id_to_word = new Map();
    for (var k in data) {
        if (data.hasOwnProperty(k)) {
            var word = data[k];
            if(isNaN(parseInt(word["head"])) === false) {
                add_edge(parseInt(word["head"]), parseId(word["id"]));
                id_to_word.set(parseId(word["id"]), word["form"]);
            }
        }
    }
    console.log("Has Cycles:");
    console.log(_is_cyclic());
    if (_is_cyclic()) {
        console.log("Cycle List:");
        var c_list = cycle_list();
        for (var i = 0; i < c_list.length; i++) {
            var cycle = c_list[i];
            console.log(cycle);
            var word_form = [];
            for (var j = 0; j < cycle.length; j++) {
                word_form.push(id_to_word.get(cycle[j]));
            }
            var output = "";
            for (var j = 0; j < word_form.length; j++) {
                output += String(word_form[j]) + "-->"
            }
            console.log(output);
        }
    }
    return _is_cyclic();

    function add_edge(u,v) {
        if (g.get(u) === undefined) {
            g.set(u,[v]);
        }
        else {
            var getVal = g.get(u);
            getVal.push(v);
            g.set(u, getVal);
        }
    };

    var globalCycle = [];

    function dfsFunc(start, node, visited, cycle) {
        if (visited[node]) {
            if (node === start) {
                globalCycle = cycle.slice(0);
            }
            return;
        }
        cycle.push(node);
        visited[node] = true;
        if (g.get(node) !== undefined && isNaN(g.get(node)[0]) === false) {
            for (var i = 0; i < g.get(node).length; i++) {
                dfsFunc(start, g.get(node)[i], visited, cycle);
            }
        }
        visited[node] = false;
        return;
    };

    function _is_cyclic_util(start_vertex) {
        var visited = [];
        for(var i = 0; i < vertices; i++) {
            visited.push(false);
        }
        dfsFunc(start_vertex, start_vertex, visited, []);
        return [globalCycle];
    }

    function normalize_cycle(a) {
        var b = a.slice().sort();
        b.sort();
        var loc = a.indexOf(b[0]);
        var c = [];
        for (var i = 0; i < a.length; i++) {
            c.push(0);
        }
        for (var i = 0; i < a.length; i++) {
            var index = i - loc;
            if (index < 0) {
                index = a.length + i - loc;
            }
            c[index] = a[i];
        }
        return c;
    };

    function cycle_list() {
        var cycles = [];
        for (var node = 0; node < vertices; node++) {
            //console.log("start");
            //console.log(node);
            globalCycle = [];
            var c_datas = _is_cyclic_util(node);
            //console.log("complete");
            for (var i = 0; i < c_datas.length; i++) {
                var c_data = c_datas[i];
                if (c_data.length > 0) {
                    c_data = normalize_cycle(c_data);
                    var checkEqual = 0;
                    for (var j = 0; j < cycles.length; j++) {
                        if (checkIfEqual(cycles[j],c_data) === true) {
                            checkEqual = 1;
                            break;
                        }
                    }
                    if (checkEqual === 0) {
                        cycles.push(c_data);
                    }
                }
            }
        }
        return cycles;
    };

    function checkIfEqual(a,b) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    function parseId(id) {
        var nfid = id.substr(2);
        return parseInt(nfid);
    }

    function _is_cyclic() {
        return cycle_list().length > 0;
    };
}
