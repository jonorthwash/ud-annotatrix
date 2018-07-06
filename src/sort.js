'use strict';

const _ = require('underscore');

// NB: sorting will break if sentence has more than this many tokens
const LARGE_NUMBER = 10000;

function vertical(n1, n2) {
  const num1 = parseInt(n1.id().slice(2)),
    num2 = parseInt(n2.id().slice(2));

  if (num1 !== num2) {
    return num1 - num2;
  } else {
    if (n1.hasClass('wf') && n2.hasClass('pos')) {
      return 1;
    } else if (n1.hasClass('pos') && n2.hasClass('wf')) {
      return -1
    } else {
      return 0;
    }
  }
}

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
