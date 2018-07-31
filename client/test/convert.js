'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const convert = require('../convert');
const detectFormat = require('../detect');
const alerts = require('../alerts');
const nx = require('notatrix');

// export the test suite
//module.exports = () => {
  describe('convert.js', () => {

    // stubs
    const invalidConlluAlert = sinon.stub(alerts, 'unableToConvertToConllu'),
      invalidCG3Alert = sinon.stub(alerts, 'unableToConvertToCG3');
    let invalidCalls = 1;

    _.each(convert.to, (convertToFormat, methodName) => {

      const expectedFormat = {
        plainText: 'plain text',
        conllu: 'CoNLL-U',
        cg3: 'CG3'
      }[methodName];

      describe(`convert to ${expectedFormat}`, () => {
        utils.forEachText((originalText, originalFormat, name) => {
          it(`should convert ${originalFormat}:${name} to ${expectedFormat}`, () => {

            const convertedText = convertToFormat(originalText);

            if (originalFormat === 'Unknown') {

              // can't convert out of Unknown format
              expect(convertedText).to.equal(null);

            } else if (originalFormat === 'CG3'
              && convertedText === null) {

              // this could be null if we're ambiguous, so make sure
              //   that we alerted the user
              expect(invalidConlluAlert.callCount).to.equal(invalidCalls);
              invalidCalls++;

            } else {

              // the basic case, we actually converted something
              const convertedFormat = detectFormat(convertedText);
              expect(convertedFormat).to.equal(expectedFormat);


              // convert from nx format
              if (originalFormat === 'CoNLL-U') {

                const sent = nx.Sentence.fromConllu(originalText);
                const convertedNx = convertToFormat(sent.nx);
                const convertedFormat = detectFormat(convertedNx);
                expect(convertedFormat).to.equal(expectedFormat);

              } else if (originalFormat === 'CG3') {

                const sent = nx.Sentence.fromCG3(originalText);
                const convertedNx = convertToFormat(sent.nx);
                const convertedFormat = detectFormat(convertedNx);
                expect(convertedFormat).to.equal(expectedFormat);

              } else if (originalFormat === 'plain text') {

                const sent = nx.Sentence.fromText(originalText);
                const convertedNx = convertToFormat(sent.nx);
                const convertedFormat = detectFormat(convertedNx);
                expect(convertedFormat).to.equal(expectedFormat);

              }
            }
          });
        });
      });
    });
  });
//};
