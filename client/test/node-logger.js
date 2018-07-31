'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');

// we're testing the behavior of node-logger.js
const Log = require('../node-logger');
// with this data
const data = [
  {
    param: 'CRITICAL',
    levelName: 'CRITICAL',
    writes: 1,
  },
  {
    param: 'ERROR',
    levelName: 'ERROR',
    writes: 2,
  },
  {
    param: 'WARN',
    levelName: 'WARN',
    writes: 3,
  },
  {
    param: 'INFO',
    levelName: 'INFO',
    writes: 4,
  },
  {
    param: 'DEBUG',
    levelName: 'DEBUG',
    writes: 5,
  },
  {
    param: 'INVALID',
    levelName: 'CRITICAL',
    writes: 1,
  },
];


// export the test suite
//module.exports = () => {
  describe('node-logger.js', () => {

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
        it(`should call Log._write ${datum.writes} time${datum.writes > 1
          ? 's' : ''}`, () => {

          // sandbox stuff for isolated texts w/o side effects
          const sandbox = sinon.createSandbox(),
            consoleGroup = sandbox.stub(console, 'group'),
            consoleTrace = sandbox.stub(console, 'trace'),
            consoleGroupEnd = sandbox.stub(console, 'groupEnd');

          // stub this to count how many times it's called
          const write = sandbox.stub(log, '_write');

          log.critical(testMessage);
          log.error(testMessage);
          log.warn(testMessage);
          log.info(testMessage);
          log.debug(testMessage);

          expect(write.callCount).to.equal(datum.writes);

          // unstub
          sandbox.restore();
        });


      });
    });
  });
//};
