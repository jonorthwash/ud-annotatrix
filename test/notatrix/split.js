"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("../../src/notatrix");

describe("split", () => {
  it(`should throw errors if given bad input`, () => {
    const sent = new nx.Sentence("test");

    expect(() => sent.split()).to.throw(nx.NxError);
    expect(() => sent.split("a")).to.throw(nx.NxError);
    expect(() => sent.split(1)).to.throw(nx.NxError);
    expect(() => sent.split({})).to.throw(nx.NxError);
    expect(() => sent.split([])).to.throw(nx.NxError);
    expect(() => sent.split(null)).to.throw(nx.NxError);

    expect(() => sent.split(sent.tokens[0])).to.throw(nx.NxError);
    expect(() => sent.split(sent.tokens[0], sent.tokens[1]))
        .to.throw(nx.NxError);
    expect(() => sent.split(sent.tokens[0], "a")).to.throw(nx.NxError);
    expect(() => sent.split(sent.tokens[0], {})).to.throw(nx.NxError);
    expect(() => sent.split(sent.tokens[0], [])).to.throw(nx.NxError);
    expect(() => sent.split(sent.tokens[0], null)).to.throw(nx.NxError);
  });

  it(`should split regular tokens correctly for simple sentences`, () => {
    var sent, tok0;

    const reset = () => {
      sent = new nx.Sentence(`1	testing	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
      tok0 = sent.tokens[0];
    };

    reset(); // split at the beginning

    sent.split(tok0, 0);
    expect(sent.to("conllu").output).to.equal(`1	_	_	_	_	_	_	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split at beginning (negative index)

    sent.split(tok0, -10);
    expect(sent.to("conllu").output).to.equal(`1	_	_	_	_	_	_	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split at the end

    sent.split(tok0, 10);
    expect(sent.to("conllu").output).to.equal(`1	testing	_	_	_	_	_	_	_	_
2	_	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split in the middle

    sent.split(tok0, 2);
    expect(sent.to("conllu").output).to.equal(`1	te	_	_	_	_	_	_	_	_
2	sting	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);
  });

  it(`should split regular tokens correctly for sentences with dependencies`,
     () => {
       var sent, tok0;

       const reset = () => {
         sent = new nx.Sentence(`1	testing	_	_	_	_	3	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
         tok0 = sent.tokens[0];
       };

       reset(); // split at the beginning

       sent.split(tok0, 0);
       expect(sent.to("conllu").output).to.equal(`1	_	_	_	_	_	4	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

       reset(); // split at beginning (negative index)

       sent.split(tok0, -10);
       expect(sent.to("conllu").output).to.equal(`1	_	_	_	_	_	4	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

       reset(); // split at the end

       sent.split(tok0, 10);
       expect(sent.to("conllu").output).to.equal(`1	testing	_	_	_	_	4	_	_	_
2	_	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

       reset(); // split in the middle

       sent.split(tok0, 2);
       expect(sent.to("conllu").output).to.equal(`1	te	_	_	_	_	4	_	_	_
2	sting	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

       sent = new nx.Sentence(`# text = He boued e tebr Mona er gegin.
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

       sent.split(sent.tokens[1], 2);
       expect(sent.to("conllu").output)
           .to.equal(`# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
1	He	he	det	_	pos|f|sp	2	det	_	_
2	bo	boued	n	_	m|sg	5	obj	_	_
3	ued	_	_	_	_	_	_	_	_
4	e	e	vpart	_	obj	5	aux	_	_
5	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
6	Mona	Mona	np	_	ant|f|sg	5	nsubj	_	_
7-8	er	_	_	_	_	_	_	_	_
7	_	e	pr	_	_	9	case	_	_
8	_	an	det	_	def|sp	9	det	_	_
9	gegin	kegin	n	_	f|sg	5	obl	_	_
10	.	.	sent	_	_	5	punct	_	_`);
     });

  it(`should split superTokens correctly for simple sentences`, () => {
    // split a two-word superToken

    const s1 = new nx.Sentence(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);

    s1.split(s1.tokens[0]);
    expect(s1.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);

    // split a three-word superToken

    const s2 = new nx.Sentence(`1-3	abc	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_
4	d	_	_	_	_	_	_	_	_`);

    s2.split(s2.tokens[0]);
    expect(s2.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_
4	d	_	_	_	_	_	_	_	_`);
  });

  it(`should split superTokens correctly for sentences with dependencies`,
     () => {
       var sent, tok0, sub0, sub1, tok1;

       const reset = () => {
         sent = new nx.Sentence(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
         tok0 = sent.tokens[0];
         sub0 = tok0.subTokens[0];
         sub1 = tok0.subTokens[1];
         tok1 = sent.tokens[1];
       };

       reset(); // subToken depends on token

       sub0.addHead(tok1);
       expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	3	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
       sent.split(tok0);
       expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	3	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);

       reset(); // token depends on subToken

       tok1.addHead(sub0);
       expect(sent.to("conllu").output).to.equal(`1-2	ab	_	_	_	_	_	_	_	_
1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	1	_	_	_`);
       sent.split(tok0);
       expect(sent.to("conllu").output).to.equal(`1	a	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	1	_	_	_`);

       sent = new nx.Sentence(`# text = He boued e tebr Mona er gegin.
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

       sent.split(sent.tokens[5]);
       expect(sent.to("conllu").output)
           .to.equal(`# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
1	He	he	det	_	pos|f|sp	2	det	_	_
2	boued	boued	n	_	m|sg	4	obj	_	_
3	e	e	vpart	_	obj	4	aux	_	_
4	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
5	Mona	Mona	np	_	ant|f|sg	4	nsubj	_	_
6	_	e	pr	_	_	8	case	_	_
7	_	an	det	_	def|sp	8	det	_	_
8	gegin	kegin	n	_	f|sg	4	obl	_	_
9	.	.	sent	_	_	4	punct	_	_`);
     });

  it(`should split subTokens correctly for simple sentences`, () => {
    var sent, sub0;

    const reset = () => {
      sent = new nx.Sentence(`1-2	testingb	_	_	_	_	_	_	_	_
1	testing	_	_	_	_	_	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
      sub0 = sent.tokens[0].subTokens[0];
    };

    reset(); // split at the beginning

    sent.split(sub0, 0);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	_	_	_	_	_	_	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split at beginning (negative index)

    sent.split(sub0, -10);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	_	_	_	_	_	_	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split at the end

    sent.split(sub0, 10);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	testing	_	_	_	_	_	_	_	_
2	_	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split in the middle

    sent.split(sub0, 2);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	te	_	_	_	_	_	_	_	_
2	sting	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);
  });

  it(`should split subTokens correctly for sentences with dependencies`, () => {
    var sent, sub0;

    const reset = () => {
      sent = new nx.Sentence(`1-2	testingb	_	_	_	_	_	_	_	_
1	testing	_	_	_	_	3	_	_	_
2	b	_	_	_	_	_	_	_	_
3	c	_	_	_	_	_	_	_	_`);
      sub0 = sent.tokens[0].subTokens[0];
    };

    reset(); // split at the beginning

    sent.split(sub0, 0);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	_	_	_	_	_	4	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split at beginning (negative index)

    sent.split(sub0, -10);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	_	_	_	_	_	4	_	_	_
2	testing	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split at the end

    sent.split(sub0, 10);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	testing	_	_	_	_	4	_	_	_
2	_	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    reset(); // split in the middle

    sent.split(sub0, 2);
    expect(sent.to("conllu").output).to.equal(`1-3	testingb	_	_	_	_	_	_	_	_
1	te	_	_	_	_	4	_	_	_
2	sting	_	_	_	_	_	_	_	_
3	b	_	_	_	_	_	_	_	_
4	c	_	_	_	_	_	_	_	_`);

    sent = new nx.Sentence(`# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
1	He	he	det	_	pos|f|sp	2	det	_	_
2	boued	boued	n	_	m|sg	4	obj	_	_
3	e	e	vpart	_	obj	4	aux	_	_
4	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
5	Mona	Mona	np	_	ant|f|sg	4	nsubj	_	_
6-7	er	_	_	_	_	_	_	_	_
6	test_1	e	pr	_	_	8	case	_	_
7	test_2	an	det	_	def|sp	8	det	_	_
8	gegin	kegin	n	_	f|sg	4	obl	_	_
9	.	.	sent	_	_	4	punct	_	_`);

    sent.split(sent.tokens[5].subTokens[1], 2);
    expect(sent.to("conllu").output)
        .to.equal(`# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
1	He	he	det	_	pos|f|sp	2	det	_	_
2	boued	boued	n	_	m|sg	4	obj	_	_
3	e	e	vpart	_	obj	4	aux	_	_
4	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
5	Mona	Mona	np	_	ant|f|sg	4	nsubj	_	_
6-8	er	_	_	_	_	_	_	_	_
6	test_1	e	pr	_	_	9	case	_	_
7	te	an	det	_	def|sp	9	det	_	_
8	st_2	_	_	_	_	_	_	_	_
9	gegin	kegin	n	_	f|sg	4	obl	_	_
10	.	.	sent	_	_	4	punct	_	_`);
  });
});
