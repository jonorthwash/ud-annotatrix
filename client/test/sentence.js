'use strict';

// all tests need this stuff
const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const Sentence = require('../sentence');

//module.exports = () => {
  describe('sentence.js', () => {

    describe('should initialize without errors, preserve inputs and formats, stringify', () => {
      utils.forEachText((text, format, name) => {
        it(`for ${format}:${name}`, () => {

          if (format === 'Unknown')
            return;
            
          let s = new Sentence(text);

          expect(s.format).to.equal(format);
          expect(() => s.toString).to.not.throw();
        });
      });
    });

    describe('in-place mutations', () => {
      it(`perform updates without losing data`, () => {

        const a = `# text = "This is a simple sentence."
# labels = label1 another_label a-third-label
1	This	This	_	_	_	_	_	_	_
2	is	is	_	_	_	_	_	_	_
3	a	a	_	_	_	_	_	_	_
4	simple	simple	_	_	_	_	_	_	_
5	sentence	sentence	_	_	_	_	_	_	_
6	.	.	PUNCT	PUNCT	_	_	_	_	_`;

        const b = `# text = "This is a simple sentence."
# labels = label1 another_label a-third-label
1	This	This	_	_	_	_	_	_	_
2	is	is	_	_	_	_	_	_	miscellaneous_comment
3	a	a	_	_	_	_	_	_	_
4	simple	simple	_	_	_	_	_	_	_
5	sentence	sentence	_	_	_	_	_	_	_
6	.	.	PUNCT	PUNCT	_	_	_	_	_`;

        const a2 = `"<This>"
	"This" _ _ @_ #1->
"<is>"
	"is" _ _ @_ #2->
"<a>"
	"a" _ _ @_ #3->
"<simple>"
	"simple" _ _ @_ #4->
"<sentence>"
	"sentence" _ _ @_ #5->
"<.>"
	"." PUNCT _ @_ #6->
`;

        let s = new Sentence(a);
        s.update(b);
        expect(s.conllu).to.equal(b);

        s.update(a2);
        expect(s.conllu).to.equal(b);

        s = new Sentence(b);
        s.update(a);
        expect(s.conllu).to.equal(a);

      })
    });
  });
//};
