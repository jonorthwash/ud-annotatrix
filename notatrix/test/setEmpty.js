const _ = require("underscore");
const expect = require("chai").expect;
const sinon = require("sinon");
const utils = require("./utils");
const nx = require("..");
const data = require("./data");

describe("setEmpty", () => {
  it("toggling isEmpty on trivial data", () => {
    const s = new nx.Sentence(data["CoNLL-U"]["empty"]);
    expect(s.to("CoNLL-U").output).to.equal(`1	Sue	Sue	_	_	_	_	_	_	_
2	likes	like	_	_	_	_	_	_	_
3	coffee	coffee	_	_	_	_	_	_	_
4	and	and	_	_	_	_	_	_	_
5	Bill	Bill	_	_	_	_	_	_	_
5.1	likes	like	_	_	_	_	_	_	_
6	tea	tea	_	_	_	_	_	_	_`);

    s.tokens[1].setEmpty(true);
    expect(s.to("CoNLL-U").output).to.equal(`1	Sue	Sue	_	_	_	_	_	_	_
1.1	likes	like	_	_	_	_	_	_	_
2	coffee	coffee	_	_	_	_	_	_	_
3	and	and	_	_	_	_	_	_	_
4	Bill	Bill	_	_	_	_	_	_	_
4.1	likes	like	_	_	_	_	_	_	_
5	tea	tea	_	_	_	_	_	_	_`);

    s.tokens[2].setEmpty(true);
    expect(s.to("CoNLL-U").output).to.equal(`1	Sue	Sue	_	_	_	_	_	_	_
1.1	likes	like	_	_	_	_	_	_	_
1.2	coffee	coffee	_	_	_	_	_	_	_
2	and	and	_	_	_	_	_	_	_
3	Bill	Bill	_	_	_	_	_	_	_
3.1	likes	like	_	_	_	_	_	_	_
4	tea	tea	_	_	_	_	_	_	_`);

    s.tokens[1].setEmpty(false);
    s.tokens[2].setEmpty(false);
    expect(s.to("CoNLL-U").output).to.equal(`1	Sue	Sue	_	_	_	_	_	_	_
2	likes	like	_	_	_	_	_	_	_
3	coffee	coffee	_	_	_	_	_	_	_
4	and	and	_	_	_	_	_	_	_
5	Bill	Bill	_	_	_	_	_	_	_
5.1	likes	like	_	_	_	_	_	_	_
6	tea	tea	_	_	_	_	_	_	_`);
  });

  it("toggling isEmpty on data with relations", () => {
    const s = new nx.Sentence(data["CoNLL-U"]["ud_example_tabs"]);
    expect(s.to("CoNLL-U").output)
        .to.equal(
            `1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|4:nsubj	_
2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Pres	0	root	0:root	_
3	and	and	CONJ	CC	_	4	cc	4:cc	_
4	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Pres	2	conj	2:conj	_
5	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|4:obj	_
6	.	.	PUNCT	.	_	2	punct	2:punct	_`);

    s.tokens[2].setEmpty(true);
    expect(s.to("CoNLL-U").output)
        .to.equal(
            `1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|3:nsubj	_
2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Pres	0	root	0:root	_
2.1	and	and	CONJ	CC	_	_	_	3:cc	_
3	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Pres	2	conj	2:conj	_
4	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|3:obj	_
5	.	.	PUNCT	.	_	2	punct	2:punct	_`);
  });
});
