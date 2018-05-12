'use strict'

var U_DEPRELS = ['acl', 'advcl', 'advmod', 'amod', 'appos', 'aux', 'case',
    'cc', 'ccomp', 'clf', 'compound', 'conj', 'cop', 'csubj', 'dep', 'det',
    'discourse', 'dislocated', 'expl', 'fixed', 'flat', 'goeswith', 'iobj',
    'list', 'mark', 'nmod', 'nsubj', 'nummod', 'obj', 'obl', 'orphan',
    'parataxis', 'punct', 'reparandum', 'root', 'vocative', 'xcomp'];
var U_POS = ['ADJ', 'ADP', 'ADV', 'AUX', 'CCONJ', 'DET', 'INTJ', 'NOUN',
    'NUM', 'PART', 'PRON', 'PROPN', 'PUNCT', 'SCONJ', 'SYM', 'VERB', 'X'];

// TODO: Make this more clever, e.g. CCONJ can have a dependent in certain
// circumstances, e.g. and / or
var U_POS_LEAF = ['AUX', 'CCONJ', 'PART', 'PUNCT', 'SCONJ']; // no ADP

function is_upos(s) {
    log.debug(`called is_pos(${s})`);

    // Checks if a relation is in the list of valid parts of speech
    // @s = the input relation
    // returns a tuple of [bool, message]
    $.each(U_POS, (i, u_pos) => {
        if (u_pos === s)
            return [true, '', {}];
    });
    return [false, 'err_upos_invalid', {'tag': s}];
}


function is_udeprel(s) {
    log.debug(`called is_udeprel(${s})`);

    // Checks if a relation is in the list of valid relations
    // @s = the input relation
    // returns a tuple of [bool, message]
    var s_deprel = s;
    // Language specific relations are a universal relation + : + some string
    if(s.search(':') >= 0) {
      s_deprel = s.split(':')[0];
    }
    // Check if the deprel is in the list of valid relations
    for(var i = 0; i < U_DEPRELS.length; i++) {
      if(U_DEPRELS[i] == s_deprel) {
        return [true, '', {}];
      }
    }
    return [false, 'err_udeprel_invalid', {'label': s}];
}

function is_leaf(s) {
    log.debug(`called is_leaf(${s})`);

    // Checks if a node is in the list of part-of-speech tags which
    // are usually leaf nodes
    // @s = part of speech tag

    // http://universaldependencies.org/u/dep/punct.html
    // Tokens with the relation punct always attach to content words (except in cases of ellipsis) and can never have dependents.

    for(var i = 0; i < U_POS_LEAF.length; i++) {
      if(U_POS_LEAF[i] == s) {
        return [true, '', {}];
      }
    }
    return [false, 'err_udep_leaf_node', {'tag': s}];

}


function is_projective_nodes(tree, nodeSet) {
    log.debug(`called is_projective_nodes(tree: ${JSON.stringify(tree)}, nodeSet: ${JSON.stringify(nodeSet)})`);

    // Checks to see if a particular dependent has a non-projective head
   // console.log('is_projective_nodes()', tree) ;
   // console.log('is_projective_nodes()', nodeSet) ;
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

    // console.log('is_projective()','heads', heads);
    // console.log('is_projective()','nodes', nodes);

    var res = true;

    for(let i in nodeSet) {          // i here is the index of the node in nodeSet e.g. i = 0, nodeSet = [9]
        var n_i =  nodeSet[i];
        for(let j in nodes) {
            var n_j =  nodes[j];
            console.log('i:',nodes[n_i],'j:',nodes[j],'h(i):',heads[n_i],'h(j):',heads[n_j]);
            if((nodes[j] > nodes[n_i]) && (nodes[j] < heads[n_i])) {
                if((heads[n_j] > heads[n_i]) || (heads[n_j] < nodes[n_i])) {
                    res = false;
                    // console.log('[0] is_projective()',res);
                    return res;
                }
            }
            if((nodes[j] > heads[n_i]) && (nodes[j] < nodes[n_i])) {
                if((heads[n_j] > nodes[n_i]) || (heads[n_j] < heads[n_i])) {
                    res = false;
                    // console.log('[1] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > nodes[n_i] && heads[n_j] < heads[n_i]) {
                if(nodes[j] < nodes[n_i] || nodes[j] > heads[n_i]) {
                    res = false;
                    // console.log('[2] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > heads[n_i] && heads[n_j] < nodes[n_i]) {
                if(nodes[j] > nodes[n_i] || nodes[j] < heads[n_i]) {
                    res = false;
                    // console.log('[3] is_projective()',res);
                    return res;
                }
            }
        }
    }
//    console.log('is_projective()', res);

    return res;
}



function is_projective(tree) {
    log.debug(`called is_projective(${JSON.stringify(tree)})`);

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

function is_depend_cycles(tree) {
    log.debug(`called is_depend_cycles(${JSON.stringify(tree)})`);

    const _is_cyclic_util = (start_vertex) => {
        log.debug(`called _is_cyclic_util(${start_vertex})`);

        // Finds cycles starting at a vertex
        let current_vertex = start_vertex,
            visited = [current_vertex];

        while (g.get(current_vertex) !== undefined
            && g.get(current_vertex) !== start_vertex
            && visited.indexOf(g.get(current_vertex)) === -1) {

            current_vertex = g.get(current_vertex);
            visited.push(current_vertex);
        }

        if (g.get(current_vertex) !== undefined && g.get(current_vertex)==start_vertex)
            return visited;

        return [];
    };
    const get_cycles = () => {
        log.debug(`called get_cycles()`);

    	  // Finds all cycles
        let cycles = [];
        for (let node = 0; node < vertices; node++) {
            let c_data = _is_cyclic_util(node);
            if (c_data.length > 0) {
                c_data = normalize_cycle(c_data);
                let isEqual = false;
                for (let j = 0, l = cycles.length; j < l; j++) {
                    if (checkIfEqual(cycles[j], c_data)) {
                        isEqual = true;
                        break;
                    }
                }
                if (!isEqual)
                    cycles.push(c_data);
            }
        }

        log.debug(`cycles: ${JSON.stringify(cycles)}`);
        return cycles;
    };
    const _is_cyclic = () => {
        log.debug(`called _is_cyclic()`);

        const cycles = get_cycles();
        return (cycles.length ? cycles : null);
    };
    const normalize_cycle = (a) => {
        log.debug(`called normalize_cycle(${JSON.stringify(a)})`);

	      //Normalizes cycles for easy comparisons
        let b = a.slice().sort(),
            loc = a.indexOf(b[0]),
            c = new Array(a.length).fill(0);

        for (let i = 0, l = a.length; i < l; i++) {
            let index = i - loc;
            if (index < 0)
                index += a.length;

            c[index] = a[i];
        }

        log.debug(`normalized cycle: ${JSON.stringify(c)}`);
        return c;
    };
    const checkIfEqual = (a, b) => {
        log.debug(`called checkIfEqual(a: ${JSON.stringify(a)}, b: ${JSON.stringify(b)})`);

	      //Checks if two cycles are equal
        if (a.length !== b.length)
            return false;

        for (let i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    };
    const parseId = (id) => {
        log.debug(`called parseId(${id})`);
        return parseInt(id.substr(2));
    }

    // Finds the cycles in the tree
    let g = new Map(),
        data = tree,
        vertices = Object.keys(data).length + 1,
        id_to_word = new Map();

    $.each(data, (i, word) => {
        const head = parseInt(word.head), id = parseId(word.id);
        if (!isNaN(head) && !isNaN(id)) {
            g.set(id, head);
            id_to_word.set(id, word.form);
        }
    });

    const is_cyclic = _is_cyclic();
    log.debug(`is_depend_cycles(): has cycles: ${is_cyclic}`);

    if (is_cyclic) {

        const c_list = get_cycles();
        log.debug(`is_depend_cycles(): cycle list: ${JSON.stringify(c_list)}`);

        $.each(c_list, (i, cycle) => {
            log.debug(`is_depend_cycles(): cycle: ${JSON.stringify(cycle)}`);

            const output = cycle.map((element) => {
                const form = id_to_word.get(element);
                return String(form);
            }).join('-->');

            log.debug(`is_depend_cycles(): output: ${JSON.stringify(output)}`);
        });
    }

    return is_cyclic;
}

function is_relation_conflict(tree) {
    log.debug(`called is_relation_conflict(${JSON.stringify(tree)})`);


    let count = new Map();
    $.each(tree, (i, word) => {
        if (word.deprel !== undefined) {
            list = (count.has(word.deprel) ? count.get(word.deprel) : []).concat(word.head);
            count.set(word.deprel, list);
        }
    });
    log.debug(`count: ${JSON.stringify(count)}`);


    let totalSubjects = new Map();
    if (count.has('nsubj')) {
        $.each(count.get('nsubj'), (i, nsubj) => {
            value = (totalSubjects.has(nsubj) ? totalSubjects.get(nsubj) + 1 : 1);
            totalSubjects.set(nsubj, value);
        });
    }
    if (count.has('csubj')) {
        $.each(count.get('csubj'), (i, csubj) => {
            value = (totalSubjects.has(csubj) ? totalSubjects.get(csubj) + 1 : 1);
            totalSubjects.set(nsubj, value);
        });
    }
    log.debug(`totalSubjects: ${JSON.stringify(totalSubjects)}`);


    let totalObjects = new Map();
    if (count.has('obj')) {
        $.each(count.get('obj'), (i, obj) => {
            value = (totalObjects.has(obj) ? totalObjects.get(obj) + 1 : 1);
            totalObjects.set(obj, value);
        });
    }
    log.debug(`totalObjects: ${JSON.stringify(totalObjects)}`);


    let conflicts = new Map();
    totalSubjects.forEach((i, subj, map) => {
        if (i > 1) {
            list = (conflicts.has(subj) ? conflicts.get(subj) : []).concat('subj');
            conflicts.set(subj, list);
        }
    });
    totalObjects.forEach((i, obj, map) => {
        if (i > 1) {
            list = (conflicts.has(obj) ? conflicts.get(obj) : []).concat('obj');
            conflicts.set(obj, list);
        }
    });
    if (count.has('obj') && count.has('ccomp'))
        conflicts.set('objccomp', []);        
    log.debug(`conflicts: ${JSON.stringify(conflicts)}`);


    return conflicts;
}
