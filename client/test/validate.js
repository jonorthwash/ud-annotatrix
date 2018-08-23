'use strict';

const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('../utils'),
  nx = require('notatrix');

describe('dependency classes', () => {
  function getClasses(sent, token, head) {
    return utils.validate.depEdgeClasses(sent, token, head);
  }

  it('should detect leaf nodes', () => {
    throw new Error('not implemented');
  });

  it('should detect missing deprels', () => {

    const s = new nx.Sentence(`1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	4	invalid	_	_
3	a	_	_	_	_	1	nummod	_	_
4	test	_	_	_	_	3	_	_	_`);
    const [t1, t2, t3] = [s.tokens[1], s.tokens[2], s.tokens[3]];
    const [h1, h2, h3] = [t1.heads.first, t2.heads.first, t3.heads.first];

    expect(getClasses(s, t1, h1)).to.equal('dependency error');
    expect(getClasses(s, t2, h2)).to.equal('dependency');
    expect(getClasses(s, t3, h3)).to.equal('dependency incomplete');

  });

  it('should detect cycles', () => {

    function expectClasses(sent, index, classes) {
      const token = sent.tokens[index];
      const head = token.heads.first;
      expect(getClasses(sent, token, head)).to.equal(classes);
    }

    let s;

    s = new nx.Sentence(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	3	nummod	_	_
3	c	_	_	_	_	_	_	_	_`);
    expectClasses(s, 1, 'dependency');

    s = new nx.Sentence(`1	a	_	_	_	_	2	nummod	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	2	nummod	_	_`);
    expectClasses(s, 0, 'dependency');
    expectClasses(s, 2, 'dependency');

    s = new nx.Sentence(`1	a	_	_	_	_	0	root	_	_
2	b	_	_	_	_	1	nummod	_	_
3	c	_	_	_	_	2	nummod	_	_`);
    expectClasses(s, 0, 'dependency');
    expectClasses(s, 1, 'dependency');
    expectClasses(s, 2, 'dependency');

    s = new nx.Sentence(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	3	nummod	_	_
3	c	_	_	_	_	2	nummod	_	_`);
    expectClasses(s, 1, 'dependency error');
    expectClasses(s, 2, 'dependency error');

    s = new nx.Sentence(`1	a	_	_	_	_	3	nummod	_	_
2	b	_	_	_	_	1	nummod	_	_
3	c	_	_	_	_	2	nummod	_	_`);
    expectClasses(s, 0, 'dependency error');
    expectClasses(s, 1, 'dependency error');
    expectClasses(s, 2, 'dependency error');

    s = new nx.Sentence(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	1	nummod	1:nummod|3:nummod	_
3	c	_	_	_	_	2	nummod	_	_`);
    expectClasses(s, 1, 'dependency');
    expect(getClasses(s, s.tokens[1], s.tokens[1].heads._items[1])).to.equal('dependency error');
    expectClasses(s, 2, 'dependency error');

    s = new nx.Sentence(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	1	nummod	1:nummod|3:nummod	_
3	c	_	_	_	_	2	nummod	_	_`);
    s.unenhance();
    expectClasses(s, 1, 'dependency');
    expectClasses(s, 2, 'dependency');

  });
});

describe('POS node classes', () => {

  it('should have tests', () => {
    throw new Error('not implemented');
  });

});

describe('is valid attribute value', () => {

  it('should have tests', () => {
    throw new Error('not implemented');
  });

});
