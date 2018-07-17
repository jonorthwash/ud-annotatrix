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

// export the test suite
module.exports = () => {
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
        utils.forEachText((text, originalFormat, name) => {
          it(`should convert ${originalFormat}:${name} to ${expectedFormat}`, () => {

            const convertedText = convertToFormat(text);

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

            }

          });
        });
      });
    });
  });
};
