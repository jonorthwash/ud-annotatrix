'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const nx = require('notatrix');

const Manager = require('../manager');
const cfg = require('../config');
const errors = require('../errors');

// export the test suite
//module.exports = () => {
  describe('manager.js', () => {

  	sinon.stub(log, 'error');

  	it(`should navigate between sentences correctly`, () => {

      // dummy server object
      global.server = null;
	  	const mgr = new Manager();
  		mgr._sentences = [];

  		expect(mgr.length).to.equal(0);
  		mgr.first();
  		expect(mgr.index).to.equal(-1);
  		mgr.last();
  		expect(mgr.index).to.equal(-1);
  		mgr.prev();
  		expect(mgr.index).to.equal(-1);
  		mgr.next();
  		expect(mgr.index).to.equal(-1);
  		mgr.index = -1;
  		expect(mgr.index).to.equal(-1);
  		mgr.index = Infinity;
  		expect(mgr.index).to.equal(-1);
  		mgr.index = null;
  		expect(mgr.index).to.equal(-1);

  		mgr._sentences = [ new nx.Sentence() ];

  		expect(mgr.length).to.equal(1);
  		mgr.first();
  		expect(mgr.index).to.equal(0);
  		mgr.last();
  		expect(mgr.index).to.equal(0);
  		mgr.prev();
  		expect(mgr.index).to.equal(0);
  		mgr.next();
  		expect(mgr.index).to.equal(0);
  		mgr.index = -1;
  		expect(mgr.index).to.equal(0);
  		mgr.index = Infinity;
  		expect(mgr.index).to.equal(0);
  		mgr.index = null;
  		expect(mgr.index).to.equal(0);

  		mgr._sentences = [ new nx.Sentence(), new nx.Sentence(), new nx.Sentence() ];

  		expect(mgr.length).to.equal(3);
  		mgr.first();
  		expect(mgr.index).to.equal(0);
  		mgr.last();
  		expect(mgr.index).to.equal(2);
  		mgr.prev();
  		expect(mgr.index).to.equal(1);
  		mgr.prev();
  		expect(mgr.index).to.equal(0);
  		mgr.prev();
  		expect(mgr.index).to.equal(0);
  		mgr.next();
  		expect(mgr.index).to.equal(1);
  		mgr.next();
  		expect(mgr.index).to.equal(2);
  		mgr.next();
  		expect(mgr.index).to.equal(2);
  		mgr.index = -1;
  		expect(mgr.index).to.equal(0);
  		mgr.index = Infinity;
  		expect(mgr.index).to.equal(0);
  		mgr.index = null;
  		expect(mgr.index).to.equal(0);
  		mgr.index = 0;
  		expect(mgr.index).to.equal(0);
  		mgr.index = 1;
  		expect(mgr.index).to.equal(1);
  		mgr.index = 2;
  		expect(mgr.index).to.equal(2);
  		mgr.index = 3;
  		expect(mgr.index).to.equal(2);

  	});

  	it(`should insert and remove sentences correctly`, () => {

      // dummy server object
      global.server = null;
  		const mgr = new Manager();

  		expect(mgr.length).to.equal(1);
  		expect(mgr.index).to.equal(0);
  		expect(mgr.getSentence(0).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(1)).to.equal(null);

  		mgr.insertSentence('test');
  		expect(mgr.length).to.equal(2);
  		expect(mgr.index).to.equal(1);
  		expect(mgr.getSentence(0).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(1).text).to.equal('test');
  		expect(mgr.getSentence(2)).to.equal(null);

  		mgr.insertSentence(0, 'test2');
  		expect(mgr.length).to.equal(3);
  		expect(mgr.index).to.equal(0);
  		expect(mgr.getSentence(0).text).to.equal('test2');
  		expect(mgr.getSentence(1).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(2).text).to.equal('test');
  		expect(mgr.getSentence(3)).to.equal(null);

			mgr.insertSentence(-30, 'test3');
  		expect(mgr.length).to.equal(4);
  		expect(mgr.index).to.equal(0);
  		expect(mgr.getSentence(0).text).to.equal('test3');
  		expect(mgr.getSentence(1).text).to.equal('test2');
  		expect(mgr.getSentence(2).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(3).text).to.equal('test');
  		expect(mgr.getSentence(4)).to.equal(null);

  		mgr.insertSentence(2, 'test4');
  		expect(mgr.length).to.equal(5);
  		expect(mgr.index).to.equal(2);
  		expect(mgr.getSentence(0).text).to.equal('test3');
  		expect(mgr.getSentence(1).text).to.equal('test2');
  		expect(mgr.getSentence(2).text).to.equal('test4');
  		expect(mgr.getSentence(3).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(4).text).to.equal('test');
  		expect(mgr.getSentence(5)).to.equal(null);

  		mgr.insertSentence(10000, 'test5');
  		expect(mgr.length).to.equal(6);
  		expect(mgr.index).to.equal(5);
  		expect(mgr.getSentence(0).text).to.equal('test3');
  		expect(mgr.getSentence(1).text).to.equal('test2');
  		expect(mgr.getSentence(2).text).to.equal('test4');
  		expect(mgr.getSentence(3).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(4).text).to.equal('test');
  		expect(mgr.getSentence(5).text).to.equal('test5');
  		expect(mgr.getSentence(6)).to.equal(null);

  		let removed;

  		removed = mgr.removeSentence();
  		expect(mgr.length).to.equal(5);
  		expect(mgr.index).to.equal(4);
  		expect(mgr.getSentence(0).text).to.equal('test3');
  		expect(mgr.getSentence(1).text).to.equal('test2');
  		expect(mgr.getSentence(2).text).to.equal('test4');
  		expect(mgr.getSentence(3).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(4).text).to.equal('test');
  		expect(mgr.getSentence(5)).to.equal(null);
  		expect(removed.text).to.equal('test5');

  		removed = mgr.removeSentence(2);
  		expect(mgr.length).to.equal(4); // NOTE: extra space
  		expect(mgr.index).to.equal(3);
  		expect(mgr.getSentence(0).text).to.equal('test3');
  		expect(mgr.getSentence(1).text).to.equal('test2');
  		expect(mgr.getSentence(2).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(3).text).to.equal('test');
  		expect(mgr.getSentence(4)).to.equal(null);
  		expect(removed.text).to.equal('test4');

  		removed = mgr.removeSentence(-100);
  		expect(mgr.length).to.equal(3);
  		expect(mgr.index).to.equal(2);
  		expect(mgr.getSentence(0).text).to.equal('test2');
  		expect(mgr.getSentence(1).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(2).text).to.equal('test');
  		expect(mgr.getSentence(3)).to.equal(null);
  		expect(removed.text).to.equal('test3');

  		removed = mgr.removeSentence(100);
  		expect(mgr.length).to.equal(2);
  		expect(mgr.index).to.equal(1);
  		expect(mgr.getSentence(0).text).to.equal('test2');
  		expect(mgr.getSentence(1).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(2)).to.equal(null);
  		expect(removed.text).to.equal('test');

  		expect(() => { mgr.insertSentence(null, 'error'); }).to.throw(errors.AnnotatrixError);
  		expect(() => { mgr.removeSentence(null); }).to.throw(errors.AnnotatrixError);

  		mgr.pushSentence('push1');
  		mgr.pushSentence('push2');
  		expect(mgr.length).to.equal(4);
  		expect(mgr.index).to.equal(3);
  		expect(mgr.getSentence(0).text).to.equal('test2');
  		expect(mgr.getSentence(1).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(2).text).to.equal('push1');
  		expect(mgr.getSentence(3).text).to.equal('push2');
  		expect(mgr.getSentence(4)).to.equal(null);

  		removed = mgr.popSentence();
  		expect(mgr.length).to.equal(3);
  		expect(mgr.index).to.equal(2);
  		expect(mgr.getSentence(0).text).to.equal('test2');
  		expect(mgr.getSentence(1).text).to.equal(cfg.defaultSentence);
  		expect(mgr.getSentence(2).text).to.equal('push1');
  		expect(mgr.getSentence(3)).to.equal(null);
  		expect(removed.text).to.equal('push2');

  		mgr.setSentence(1, 'set2');
      mgr.setSentence(0, 'set1');
  		mgr.setSentence(2, 'set3');
  		mgr.setSentence(3, 'set4');
  		mgr.setSentence('set5');
  		expect(mgr.getSentence(0).text).to.equal('set1');
  		expect(mgr.getSentence(1).text).to.equal('set2');
  		expect(mgr.getSentence(2).text).to.equal('set5');
  		expect(mgr.getSentence(3)).to.equal(null);

  		mgr.sentence = 'set6';
  		expect(mgr.getSentence(2).text).to.equal('set6');

  	});

		it(`should parse sentences correctly`, () => {
			_.each([
				{ str:'this is the first test', split:['this is the first test'] },
				{ str:'this is, the second', split:['this is, the second'] },
				{ str:'one sentence.', split:['one sentence.'] },
				{ str:'one! two!', split:['one!', ' two!'] },
				{ str:'one. two! three?', split:['one.', ' two!', ' three?'] },
			], datum => {

        // dummy server object
        global.server = null;
				const mgr = new Manager();

				mgr.parse(datum.str);
				expect(mgr.length).to.equal(datum.split.length);
				expect(mgr.index).to.equal(datum.split.length - 1);

				_.each(datum.split, (chunk, i) => {
					expect(mgr.getSentence(i).text).to.equal(utils.reformatParsedText(chunk));
				});
			});
		});
  });
//};
