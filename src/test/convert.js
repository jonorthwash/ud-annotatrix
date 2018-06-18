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

/*

const converters = {
  'plain text': convert2PlainText,
  'CoNLL-U': convert2Conllu,
  'CG3': convert2CG3
};

let failures = [];

$.each(converters, (converterFormat, converter) => {
  log.out(`\nTester.converters(): checking ${converterFormat} converter`);

  $.each(TEST_DATA.texts_by_format, (format, texts) => {
    $.each(texts, (textName, text) => {
      log.out(`Tester.converters(): trying to convert text (${format}:${textName}) to ${converterFormat}`);

      const convertedText = converter(text);
      if (format === 'Unknown') {
        //this.assert(convertedText === null, `expected (${format}:${textName}) to fail to convert.`);
        //failures.push(`${format}:${textName}=>${converterFormat} (expected)`);
      } else if (convertedText === null) {
        log.warn(`Tester.converters(): text (${format}:${textName}) failed to convert to ${converterFormat}`);
        failures.push(`${format}:${textName}=>${converterFormat} (unexpected)`);
      } else if (format === 'Brackets') {
        log.warn('Tester.converters(): skipping all inputs in Brackets format');
        failures.push(`${format}:${textName}=>${converterFormat} (unexpected)`);
      } else {
        const convertedFormat = detectFormat(convertedText);
        this.assert(converterFormat === convertedFormat, `expected (${format}:${textName}) to be detected as "${converterFormat}", got "${convertedFormat}".`);
      }

    });
  });
});

log.out(`Tester.converters(): failed to convert the following items:`)
$.each(failures, (i, failure) => {
  log.out(` - ${failure}`);
});

*/
