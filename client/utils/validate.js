'use strict'

const $ = require('jquery');
const _ = require('underscore');

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

  // Checks if a relation is in the list of valid parts of speech
  // @s = the input relation
  // returns a bool
  s = (s || '').toUpperCase();

  let is_upos = false;
  U_POS.forEach(u_pos => {
    if (s === u_pos)
      is_upos = true;
  });

  return is_upos;
}


function is_udeprel(s) {

  // Checks if a relation is in the list of valid relations
  // @s = the input relation
  // returns a bool

  // Language-specific relations are `${universal_relation}:${some_string}`
  s = (s || '').split(':')[0].toLowerCase();

  let is_deprel = false;
  U_DEPRELS.forEach(u_deprel => {
    if (s.toLowerCase() === u_deprel)
      is_deprel = true;
  });

  return is_deprel;
}

function is_leaf(s, t) {

  function is_upos_leaf(pos) {

    let is_leaf = false;
    U_POS_LEAF.forEach(upos => {
      if (upos === pos)
        is_leaf = true;
    });

    return is_leaf;
  }

  // Checks if a node is in the list of part-of-speech tags which
  // are usually leaf nodes
  // @s = part of speech tag

  // http://universaldependencies.org/u/dep/punct.html
  // Tokens with the relation punct always attach to content words (except in cases of ellipsis) and can never have dependents.

  return is_upos_leaf(t.upostag || t.xpostag) && is_upos_leaf(s.upostag || s.xpostag);
}

/*
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
*/

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

/*
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
*/

function is_cycle(sent, src, tar) {

  // recursive DFS
  function is_cycle_util(sent, src, tar) {

    // visit node
    seen.add(src);

    // iterate neighbors
    let is_cycle = false;

    src.mapHeads((head, i) => {
      if (i && !sent.options.enhanced)
        return;

      is_cycle = head.token === tar
        ? true // got back to original node
        : seen.has(head.token)
          ? false
          : is_cycle_util(sent, head.token, tar); // recurse
    });

    return is_cycle;
  }

  // keep track of visited nodes
  var seen = new Set();
  return is_cycle_util(sent, src, tar);
}

function depEdgeClasses(sent, token, head) {

  let classes = new Set([ 'dependency' ]);

  if (is_leaf(head.token, token))
    classes.add('error');

  if (is_cycle(sent, head.token, token))
    classes.add('error');

  if (!head.deprel || head.deprel === '_') {
    classes.add('incomplete');
  } else if (!is_udeprel(head.deprel)) {
    classes.add('error');
  }

  return Array.from(classes).join(' ');
}

function posNodeClasses(pos) {
  return is_upos(pos)
    ? 'pos'
    : 'pos error';
}

function attrValue(attr, value) {
  return value;
}

module.exports = {
  U_DEPRELS,
  U_POS,
  depEdgeClasses,
  posNodeClasses,
  is_upos,
  is_udeprel,
  attrValue,
};
