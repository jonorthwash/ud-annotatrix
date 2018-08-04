'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');

// we're testing the behavior of browser-logger.js
const Log = require('../browser-logger');
// with this data
const data = [
  {
    param: 'CRITICAL',
    levelName: 'CRITICAL',
    logs: 1,
    infos: 0,
    warns: 0,
    errors: 1
  },
  {
    param: 'ERROR',
    levelName: 'ERROR',
    logs: 2,
    infos: 0,
    warns: 0,
    errors: 2
  },
  {
    param: 'WARN',
    levelName: 'WARN',
    logs: 3,
    infos: 0,
    warns: 1,
    errors: 2
  },
  {
    param: 'INFO',
    levelName: 'INFO',
    logs: 4,
    infos: 1,
    warns: 1,
    errors: 2
  },
  {
    param: 'DEBUG',
    levelName: 'DEBUG',
    logs: 6,
    infos: 1,
    warns: 1,
    errors: 2
  },
  {
    param: 'INVALID',
    levelName: 'CRITICAL',
    logs: 1,
    infos: 0,
    warns: 0,
    errors: 1
  },
];


// export the test suite
//module.exports = () => {
  describe('browser-logger.js', () => {

    const testMessage = 'This is the log test message';

    _.each(data, datum => {
      describe(`initialized with "${datum.param}"`, () => {

        // get a new instance our param (sets the level name and
        //   the "writer" as a no-op to avoid actual printing side effect)
        const log = new Log(datum.param, utils.noop);

        // assert the level name initiliazed correctly
        it(`should have levelName "${datum.levelName}"`, () => {
          expect(log._levelName).to.equal(datum.levelName);
        });

        // assert it's filtering messages based on its level name correctly
        it(`should call console.{whatever} correctly`, () => {

          // sandbox stuff for isolated texts w/o side effects
          const sandbox = sinon.createSandbox(),
            consoleTrace = sandbox.stub(console, 'trace'),
            consoleLog = sandbox.stub(console, 'log'),
            consoleInfo = sandbox.stub(console, 'info'),
            consoleWarn = sandbox.stub(console, 'warn'),
            consoleError = sandbox.stub(console, 'error');

          log.critical(testMessage);
          log.error(testMessage);
          log.warn(testMessage);
          log.info(testMessage);
          log.debug(testMessage);

          // assert we called each method the right number of times
          expect(consoleLog.callCount).to.equal(datum.logs);
          expect(consoleInfo.callCount).to.equal(datum.infos);
          expect(consoleWarn.callCount).to.equal(datum.warns);
          expect(consoleError.callCount).to.equal(datum.errors);

          // unstub
          sandbox.restore();

        });
      });
    });
  });
//};
