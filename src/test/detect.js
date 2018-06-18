'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const detectFormat = require('../detect');

// export the test suite
module.exports = () => {
  describe('detectFormat.js', () => {
    it(`should detect all the formats`, () => {
      utils.forEachText((text, format, name) => {

        const detectedFormat = detectFormat(text);
        expect(detectedFormat).to.equal(format);

      });
    });
  });
};
