'use strict';

const _ = require('underscore'),
  expect = require('chai').expect;

const data = require('./data/index'),
  AnnotatrixError = require('../src/errors').AnnotatrixError;


describe('first test', () => {
  it('should pass', () => {
    expect('this').to.equal('this');
  });
});
