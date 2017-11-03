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
    for(var i = 0; i < U_POS_LEAF.length; i++) {
      if(U_POS_LEAF[i] == s) { 
        return [true, "", {}];
      }
    }
    return [false, "err_udep_leaf_node", {"tag": s}];  

}

function is_cyclic(tree) {
    // Checks if a given tree is cyclic 
    // Questions: (1) do we want to deal with partial trees ? 
    // @tree = input tree
    //console.log('is_cyclic() ' + tree);

    // Let's do a DFS for each of the valid nodes in the tree,

    for(let node in tree){ 
        var visited = {};
        //console.log('| ' + tree[node].id + ' -> ' + tree[node].head);
    }

    return [false, "", {}];
}
