'use strict';

const _ = require('underscore');

// NB: sorting will break if sentence has more than this many tokens
const LARGE_NUMBER = 10000;

/**
 * Function to sort nodes with vertical orientation.
 *
 * @param {CytoscapeNode} n1
 * @param {CytoscapeNode} n2
 */
function vertical(n1, n2) {

  const num = (node) => {
    const id = parseInt(node.data('num')),
      offset = node.data('name') === 'pos-node'
        ? 0 : 0.5;

    return isNaN(id) ? -Infinity : id + offset;
  };

  const num1 = num(n1);
  const num2 = num(n2);

  return (num1 === num2
    ? 0
    : num1 < num2
      ? -1
      :  1);
}

/**
 * Function to sort nodes with left-to-right orientation.
 *
 * @param {CytoscapeNode} n1
 * @param {CytoscapeNode} n2
 */
function ltr(n1, n2) {

  const num = (node) => {
    const id = parseInt(node.data('num')),
      offset = node.data('name') === 'pos-node'
        ? LARGE_NUMBER : 0;

    return isNaN(id) ? -Infinity : id + offset;
  };

  const num1 = num(n1);
  const num2 = num(n2);

  return (num1 === num2
    ? 0
    : num1 < num2
      ? -1
      :  1);
}

/**
 * Function to sort nodes with right-to-left orientation.
 *
 * @param {CytoscapeNode} n1
 * @param {CytoscapeNode} n2
 */
function rtl(n1, n2) {
  
  const num = (node) => {
    const id = parseInt(node.data('num')),
      offset = node.data('name') === 'pos-node'
        ? 0 : LARGE_NUMBER;

    return isNaN(id) ? -Infinity : id + offset;
  };

  const num1 = num(n1);
  const num2 = num(n2);

  return (num1 === num2
    ? 0
    : num1 < num2
      ?  1
      : -1);
}

module.exports = {
  vertical,
  ltr,
  rtl
};
