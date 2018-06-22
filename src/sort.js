'use strict';

const _ = require('underscore');

function getIndex(ele) {

  // NB: sorting will break if sentence has more than this many tokens
  const LARGE_NUMBER = 10000,
    id = parseInt(ele.data('num')),
    offset = (ele.data('name') === 'pos-node' || ele.data('name') === 'super-dummy') ? LARGE_NUMBER : 0;

  return isNaN(id) ? -Infinity : id + offset;
}

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

  const num1 = getIndex(n1);
  const num2 = getIndex(n2);

  return (num1 === num2 ? 0 : num1 < num2 ? -1 : 1);
}

function rtl(n1, n2) {
  if ((n1.hasClass('wf') && n2.hasClass('wf')) // if the nodes have the same class
    || (n1.hasClass('pos') && n2.hasClass('pos'))) {
    return simpleIdSorting(n1, n2) * -1;
  } else if (n1.hasClass('wf') && n2.hasClass('pos')) {
    return -1;
  } else if (n1.hasClass('pos') && n2.hasClass('wf')) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = {
  vertical,
  ltr,
  rtl
};
