"use strict";

const _ = require("underscore");
const expect = require("chai").expect;
const sinon = require("sinon");
const utils = require("./utils");
const nx = require("../../src/notatrix");
const data = require("./data");

describe("combine", () => {
  it(`should throw errors if given bad input`, () => {
    const sent = new nx.Sentence();

    expect(() => sent.combine()).to.throw(nx.NxError);
    expect(() => sent.combine("a", "b")).to.throw(nx.NxError);
    expect(() => sent.combine(1, 2)).to.throw(nx.NxError);
    expect(() => sent.combine({}, {})).to.throw(nx.NxError);
    expect(() => sent.combine([], [])).to.throw(nx.NxError);
    expect(() => sent.combine(sent.tokens[0])).to.throw(nx.NxError);
    expect(() => sent.combine(null, sent.tokens[0])).to.throw(nx.NxError);
  });

  it(`should throw errors if one the operands is a superToken or subTokens`,
     () => {
       const sent = new nx.Sentence(data.conllu.from_cg3_with_spans);
       const tok4 = sent.tokens[4];
       const sup = sent.tokens[5];
       const sub = sup.subTokens[0];
       const tok6 = sent.tokens[6];

       expect(() => sent.combine(tok4, sup)).to.throw(nx.NxError);
       expect(() => sent.combine(sup, tok4)).to.throw(nx.NxError);
       expect(() => sent.combine(sup, sub)).to.throw(nx.NxError);
       expect(() => sent.combine(sub, sup)).to.throw(nx.NxError);
       expect(() => sent.combine(sup, tok6)).to.throw(nx.NxError);
       expect(() => sent.combine(tok6, sup)).to.throw(nx.NxError);

       expect(() => sent.combine(tok4, sub)).to.throw(nx.NxError);
       expect(() => sent.combine(sub, tok4)).to.throw(nx.NxError);
       expect(() => sent.combine(sub, sub)).to.throw(nx.NxError);
       expect(() => sent.combine(sub, sub)).to.throw(nx.NxError);
       expect(() => sent.combine(sub, tok6)).to.throw(nx.NxError);
       expect(() => sent.combine(tok6, sub)).to.throw(nx.NxError);
     });

  it(`should throw errors if things aren't adjacent`, () => {
    const sent = new nx.Sentence(data.conllu.from_cg3_with_spans);
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const tok7 = sent.tokens[7];

    expect(() => sent.combine(tok0, tok2)).to.throw(nx.NxError);
    expect(() => sent.combine(tok2, tok0)).to.throw(nx.NxError);
    expect(() => sent.combine(tok0, tok7)).to.throw(nx.NxError);
    expect(() => sent.combine(tok7, tok0)).to.throw(nx.NxError);
    expect(() => sent.combine(tok1, tok7)).to.throw(nx.NxError);
    expect(() => sent.combine(tok7, tok1)).to.throw(nx.NxError);
    expect(() => sent.combine(tok2, tok7)).to.throw(nx.NxError);
    expect(() => sent.combine(tok7, tok2)).to.throw(nx.NxError);
  });

  it(`should combine correctly for simple sentences (R->L)`, () => {
    let sent, tok0, tok1, sup, sub0, sub1;

    sent = new nx.Sentence("this is a simple sentence");
    tok0 = sent.tokens[0];
    tok1 = sent.tokens[1];

    // sanity check
    expect(sent.size).to.equal(5);
    expect(sent.tokens.length).to.equal(5);
    expect(sent.to("conllu").output).to.equal(`1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	simple	_	_	_	_	_	_	_	_
5	sentence	_	_	_	_	_	_	_	_`);

    sent.combine(tok0, tok1);
    sup = sent.tokens[0];
    sub0 = sup.subTokens[0];
    sub1 = sup.subTokens[1];

    expect(sent.size).to.equal(6);
    expect(sent.tokens.length).to.equal(4);
    expect(sent.to("conllu").output).to.equal(`1-2	thisis	_	_	_	_	_	_	_	_
1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	simple	_	_	_	_	_	_	_	_
5	sentence	_	_	_	_	_	_	_	_`);
  });

  it(`should combine correctly for simple sentences (L->R)`, () => {
    let sent, tok0, tok1, sup, sub0, sub1;

    sent = new nx.Sentence("this is a simple sentence");
    tok0 = sent.tokens[0];
    tok1 = sent.tokens[1];

    // sanity check
    expect(sent.size).to.equal(5);
    expect(sent.tokens.length).to.equal(5);
    expect(sent.to("conllu").output).to.equal(`1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	simple	_	_	_	_	_	_	_	_
5	sentence	_	_	_	_	_	_	_	_`);

    sent.combine(tok1, tok0);
    sup = sent.tokens[0];
    sub0 = sup.subTokens[0];
    sub1 = sup.subTokens[1];

    expect(sent.size).to.equal(6);
    expect(sent.tokens.length).to.equal(4);
    expect(sent.to("conllu").output).to.equal(`1-2	thisis	_	_	_	_	_	_	_	_
1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	simple	_	_	_	_	_	_	_	_
5	sentence	_	_	_	_	_	_	_	_`);
  });

  it(`should combine correctly for sentences with dependencies`, () => {
    var sent, tok0, tok1, tok2;

    const reset = () => {
      sent = new nx.Sentence("a b c");
      tok0 = sent.tokens[0];
      tok1 = sent.tokens[1];
      tok2 = sent.tokens[2];

      // sanity check
      expect(sent.size).to.equal(3);
      expect(sent.tokens.length).to.equal(3);
      expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
    };

    reset(); // src depends on tar

    tok0.addHead(tok1);
    expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	2	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
    sent.combine(tok0, tok1);
    expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);

    reset(); // tar depends on src

    tok1.addHead(tok0);
    expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	1	_	_	_
3	c	_	_	_	_	_	_	_	_`);
    sent.combine(tok0, tok1);
    expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);

    reset(); // src depends on other

    tok0.addHead(tok2);
    expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	3	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
    sent.combine(tok0, tok1);
    expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	3	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);

    reset(); // other depends on src

    tok2.addHead(tok0);
    expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	1	_	_	_`);
    sent.combine(tok0, tok1);
    expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	1	_	_	_`);

    reset(); // tar depends on other

    tok1.addHead(tok2);
    expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	3	_	_	_
3	c	_	_	_	_	_	_	_	_`);
    sent.combine(tok0, tok1);
    expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	3	_	_	_
3	c	_	_	_	_	_	_	_	_`);

    reset(); // other depends on tar

    tok2.addHead(tok1);
    expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	2	_	_	_`);
    sent.combine(tok0, tok1);
    expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	2	_	_	_`);
  });

  it(`should combine even complicated sentences`, () => {
    const sent = new nx.Sentence(`# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
1	He	he	det	_	pos|f|sp	2	det	_	_
2	boued	boued	n	_	m|sg	4	obj	_	_
3	e	e	vpart	_	obj	4	aux	_	_
4	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
5	Mona	Mona	np	_	ant|f|sg	4	nsubj	_	_
6-7	er	_	_	_	_	_	_	_	_
6	_	e	pr	_	_	8	case	_	_
7	_	an	det	_	def|sp	8	det	_	_
8	gegin	kegin	n	_	f|sg	4	obl	_	_
9	.	.	sent	_	_	4	punct	_	_`);
    const tok6 = sent.tokens[6]; // gegin
    const tok7 = sent.tokens[7]; // .

    sent.combine(tok7, tok6);
    expect(sent.to("conllu").output)
        .to.equal(`# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
1	He	he	det	_	pos|f|sp	2	det	_	_
2	boued	boued	n	_	m|sg	4	obj	_	_
3	e	e	vpart	_	obj	4	aux	_	_
4	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
5	Mona	Mona	np	_	ant|f|sg	4	nsubj	_	_
6-7	er	_	_	_	_	_	_	_	_
6	_	e	pr	_	_	8	case	_	_
7	_	an	det	_	def|sp	8	det	_	_
8-9	gegin.	_	_	_	_	_	_	_	_
8	gegin	kegin	n	_	f|sg	4	obl	_	_
9	.	.	sent	_	_	4	punct	_	_`);
  });
});
