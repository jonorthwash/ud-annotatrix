'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const detectFormat = require('../detect');
const nx = require('notatrix');

// export the test suite
//module.exports = () => {
  describe('detect.js', () => {
    utils.forEachText((text, format, name) => {
      it(`should detect ${format}:${name}`, () => {

        const detectedFormat = detectFormat(text);
        expect(detectedFormat).to.equal(format);

      });
    });

    utils.forEachText((text, format, name) => {
      let sent;
      switch (format) {
        case ('CoNLL-U'):
          sent = nx.Sentence.fromConllu(text);
          break;

        case ('CG3'):
          sent = nx.Sentence.fromCG3(text);
          break;

        case ('plain text'):
          sent = nx.Sentence.fromText(text);
          break;

        default:
          return;
      }

      it(`should detect Notatrix format for ${format}:${name}`, () => {
        const detectedFormat = detectFormat(sent.nx);
        expect(detectedFormat).to.equal('nx');
      });
    });
  });
//};
