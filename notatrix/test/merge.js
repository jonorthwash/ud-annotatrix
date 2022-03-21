"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

describe("merge", () => {
  it(`should throw errors if given bad input`, () => {
    const sent = new nx.Sentence();

    expect(() => sent.merge()).to.throw(nx.NxError);
    expect(() => sent.merge("a", "b")).to.throw(nx.NxError);
    expect(() => sent.merge(1, 2)).to.throw(nx.NxError);
    expect(() => sent.merge({}, {})).to.throw(nx.NxError);
    expect(() => sent.merge([], [])).to.throw(nx.NxError);
    expect(() => sent.merge(sent.tokens[0])).to.throw(nx.NxError);
    expect(() => sent.merge(null, sent.tokens[0])).to.throw(nx.NxError);
  });

  it(`should throw errors if one the operands is a superToken or subTokens`,
     () => {
       const sent = new nx.Sentence(nx.data.conllu.from_cg3_with_spans);
       const tok4 = sent.tokens[4];
       const sup = sent.tokens[5];
       const sub = sup.subTokens[0];
       const tok6 = sent.tokens[6];

       expect(() => sent.merge(tok4, sup)).to.throw(nx.NxError);
       expect(() => sent.merge(sup, tok4)).to.throw(nx.NxError);
       expect(() => sent.merge(sup, sub)).to.throw(nx.NxError);
       expect(() => sent.merge(sub, sup)).to.throw(nx.NxError);
       expect(() => sent.merge(sup, tok6)).to.throw(nx.NxError);
       expect(() => sent.merge(tok6, sup)).to.throw(nx.NxError);

       expect(() => sent.merge(tok4, sub)).to.throw(nx.NxError);
       expect(() => sent.merge(sub, tok4)).to.throw(nx.NxError);
       expect(() => sent.merge(sub, sub)).to.throw(nx.NxError);
       expect(() => sent.merge(sub, sub)).to.throw(nx.NxError);
       expect(() => sent.merge(sub, tok6)).to.throw(nx.NxError);
       expect(() => sent.merge(tok6, sub)).to.throw(nx.NxError);
     });

  it(`should throw errors if things aren't adjacent`, () => {
    const sent = new nx.Sentence(nx.data.conllu.from_cg3_with_spans);
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const tok7 = sent.tokens[7];

    expect(() => sent.merge(tok0, tok2)).to.throw(nx.NxError);
    expect(() => sent.merge(tok2, tok0)).to.throw(nx.NxError);
    expect(() => sent.merge(tok0, tok7)).to.throw(nx.NxError);
    expect(() => sent.merge(tok7, tok0)).to.throw(nx.NxError);
    expect(() => sent.merge(tok1, tok7)).to.throw(nx.NxError);
    expect(() => sent.merge(tok7, tok1)).to.throw(nx.NxError);
    expect(() => sent.merge(tok2, tok7)).to.throw(nx.NxError);
    expect(() => sent.merge(tok7, tok2)).to.throw(nx.NxError);
  });

  it(`should merge correctly for simple sentences`, () => {
    let sent, tok0, tok1;

    // right into left
    sent = new nx.Sentence("this is a simple sentence");
    tok0 = sent.tokens[0];
    tok1 = sent.tokens[1];

    // sanity check
    expect(sent.to("params").output).to.deep.equal([
      {form: "this"},
      {form: "is"},
      {form: "a"},
      {form: "simple"},
      {form: "sentence"},
    ]);

    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "thisis"},
      {form: "a"},
      {form: "simple"},
      {form: "sentence"},
    ]);

    // left into right
    sent = new nx.Sentence("this is a simple sentence");
    tok0 = sent.tokens[0];
    tok1 = sent.tokens[1];

    // sanity check
    expect(sent.to("params").output).to.deep.equal([
      {form: "this"},
      {form: "is"},
      {form: "a"},
      {form: "simple"},
      {form: "sentence"},
    ]);

    sent.merge(tok1, tok0);
    expect(sent.to("params").output).to.deep.equal([
      {form: "thisis"},
      {form: "a"},
      {form: "simple"},
      {form: "sentence"},
    ]);
  });

  it(`should merge correctly for sentences with dependencies`, () => {
    var sent, tok0, tok1, tok2;

    const reset = () => {
      sent = new nx.Sentence("a b c");
      tok0 = sent.tokens[0];
      tok1 = sent.tokens[1];
      tok2 = sent.tokens[2];
    };

    reset(); // src depends on tar

    tok0.addHead(tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "a", head: "2"},
      {form: "b"},
      {form: "c"},
    ]);
    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "ab"},
      {form: "c"},
    ]);

    reset(); // tar depends on src

    tok1.addHead(tok0);
    expect(sent.to("params").output).to.deep.equal([
      {form: "a"},
      {form: "b", head: "1"},
      {form: "c"},
    ]);
    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "ab"},
      {form: "c"},
    ]);

    reset(); // src depends on other

    tok0.addHead(tok2);
    expect(sent.to("params").output).to.deep.equal([
      {form: "a", head: "3"},
      {form: "b"},
      {form: "c"},
    ]);
    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "ab", head: "2"},
      {form: "c"},
    ]);

    reset(); // other depends on src

    tok2.addHead(tok0);
    expect(sent.to("params").output).to.deep.equal([
      {form: "a"},
      {form: "b"},
      {form: "c", head: "1"},
    ]);
    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "ab"},
      {form: "c", head: "1"},
    ]);

    reset(); // tar depends on other

    tok1.addHead(tok2);
    expect(sent.to("params").output).to.deep.equal([
      {form: "a"},
      {form: "b", head: "3"},
      {form: "c"},
    ]);
    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "ab"},
      {form: "c"},
    ]);

    reset(); // other depends on tar

    tok2.addHead(tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "a"},
      {form: "b"},
      {form: "c", head: "2"},
    ]);
    sent.merge(tok0, tok1);
    expect(sent.to("params").output).to.deep.equal([
      {form: "ab"},
      {form: "c", head: "1"},
    ]);
  });

  it(`should merge other fields in a sane way`, () => {
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

    sent.merge(tok7, tok6);
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
8	gegin.	kegin	n	_	f|sg	4	obl	_	_`);
  });
});
