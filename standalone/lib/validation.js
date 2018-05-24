'use strict'

const U_DEPRELS = ['acl', 'advcl', 'advmod', 'amod', 'appos', 'aux', 'case',
    'cc', 'ccomp', 'clf', 'compound', 'conj', 'cop', 'csubj', 'dep', 'det',
    'discourse', 'dislocated', 'expl', 'fixed', 'flat', 'goeswith', 'iobj',
    'list', 'mark', 'nmod', 'nsubj', 'nummod', 'obj', 'obl', 'orphan',
    'parataxis', 'punct', 'reparandum', 'root', 'vocative', 'xcomp'];
const U_POS = ['ADJ', 'ADP', 'ADV', 'AUX', 'CCONJ', 'DET', 'INTJ', 'NOUN',
    'NUM', 'PART', 'PRON', 'PROPN', 'PUNCT', 'SCONJ', 'SYM', 'VERB', 'X'];

// TODO: Make this more clever, e.g. CCONJ can have a dependent in certain
// circumstances, e.g. and / or
const U_POS_LEAF = ['AUX', 'CCONJ', 'PART', 'PUNCT', 'SCONJ']; // no ADP

function is_upos(s) {
    log.debug(`called is_pos(${s})`);

    // Checks if a relation is in the list of valid parts of speech
    // @s = the input relation
    // returns a bool
    $.each(U_POS, (i, pos) => {
        if (pos === s)
            return true;
    });
    return false;
}


function is_udeprel(s) {
    log.debug(`called is_udeprel(${s})`);

    // Checks if a relation is in the list of valid relations
    // @s = the input relation
    // returns a bool

    // Language-specific relations are `${universal_relation}:${some_string}`
    s = (s.search(':') >= 0 ? s.split(':')[0] : s);

    $.each(U_DEPRELS, (i, deprel) => {
        if (deprel === s)
            return true;
    });
    return false;
}

function is_leaf(s) {
    log.debug(`called is_leaf(${s})`);

    // Checks if a node is in the list of part-of-speech tags which
    // are usually leaf nodes
    // @s = part of speech tag

    // http://universaldependencies.org/u/dep/punct.html
    // Tokens with the relation punct always attach to content words (except in cases of ellipsis) and can never have dependents.

    $.each(U_POS_LEAF, (i, leaf) => {
        if (leaf === s)
            return true;
    });
    return false;
}


function is_projective_nodes(tree, nodeList) {
    log.debug(`called is_projective_nodes(tree: ${JSON.stringify(tree)}, nodeList: ${JSON.stringify(nodeList)})`);

    let heads = {};

    $.each(tree, (i, node) => {
        if (node) {
            if (node.head && node.id) {
                heads[id] = head;
                nodes.push(id);
            }
        }
    });

    const nodes = Object.keys(heads);
    log.debug(`is_projective_nodes(): heads: ${JSON.stringify(heads)}`);

    $.each(nodeList, (i, nodeIdFromList) => {
        const nodeToCheck = nodes[nodeIdFromList],
            headToCheck = heads[nodeIdFromList];

        $.each(nodes, (j, node) => {
            const head = heads[node];

            log.debug(`is_projective_nodes(): checking (node: ${nodeToCheck}, head: ${headToCheck}) against (node: ${node}, head: ${head})`);
            if (node > nodeToCheck && node < headToCheck
                && (head > headToCheck || head < nodeToCheck))
                return false;
            if (node > headToCheck && node < nodeToCheck
                && (head > nodeToCheck || head < headToCheck))
                return false;
            if (head > nodeToCheck && head < headToCheck
                && (node < nodeToCheck || node > headToCheck))
                return false;
            if (head > headToCheck && head < nodeToCheck
                && (node > nodeToCheck || node < headToCheck))
                return false;
        });
    });

    log.debug(`is_projective_nodes(): got true`);
    return true;
}


/*
function is_projective(tree) {
    log.debug(`called is_projective(${JSON.stringify(tree)})`);

    // Checks to see if a graph is projective
    var nodes = [];
    var heads = {};
    for(let node in tree) {
        if (!tree[node] || tree[node] == undefined) {
            continue;
        }
        var head = tree[node].head;
        var id = tree[node].id;
        if (!head || !id) {
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
            if ((nodes[j] > nodes[i]) && (nodes[j] < heads[n_i])) {
                if ((heads[n_j] > heads[n_i]) || (heads[n_j] < nodes[i])) {
                    res = false;
                    console.log('[0] is_projective()',res);
                    return res;
                }
            }
            if ((nodes[j] > heads[n_i]) && (nodes[j] < nodes[i])) {
                if ((heads[n_j] > nodes[i]) || (heads[n_j] < heads[n_i])) {
                    res = false;
                    console.log('[1] is_projective()',res);
                    return res;
                }
            }
            if (heads[n_j] > nodes[i] && heads[n_j] < heads[n_i]) {
                if (nodes[j] < nodes[i] || nodes[j] > heads[n_i]) {
                    res = false;
                    console.log('[2] is_projective()',res);
                    return res;
                }
            }
            if (heads[n_j] > heads[n_i] && heads[n_j] < nodes[i]) {
                if (nodes[j] > nodes[i] || nodes[j] < heads[n_i]) {
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
*/

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

/**
 * Cleans up CoNNL-U content.
 * @param {String} content Content of input area
 * @return {String}     Cleaned up content
 */
function cleanConllu(content) {
    log.debug(`called cleanConllu(${content})`);

    // if we don't find any tabs, then convert >1 space to tabs
    // TODO: this should probably go somewhere else, and be more
    // robust, think about vietnamese D:
    let res = content.search('\n');
    if (res < 0)
        return content;

    // maybe someone is just trying to type conllu directly...
    res = (content.match(/_/g) || []).length;
    if (res <= 2)
        return content;

    // If we don't find any tabs, then we want to replace multiple spaces with tabs
    const spaceToTab = true;//(content.search('\t') < 0);
    const newContent = content.trim().split('\n').map((line) => {
        line = line.trim();

        // If there are no spaces and the line isn't a comment,
        // then replace more than one space with a tab
        if (line[0] !== '#' && spaceToTab)
            line = line.replace(/  */g, '\t');

        return line
    }).join('\n');

    // If there are >1 CoNLL-U format sentences is in the input, treat them as such
    // conlluMultiInput(newContent); // TODO: move this one also inside of this func, and make a separate func for calling them all at the same time

    //if (newContent !== content)
        //$('#text-data').val(newContent);

    return newContent;
}
