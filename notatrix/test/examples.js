"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      utils = require("./utils");

describe("integration tests", () => {
  it("from brackets", () => {
    const nx = require("..");
    const brackets =
        "[root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]";
    const sent = new nx.Sentence(brackets);
  });

  it("from CG3", () => {
    const nx = require("..");
    const cg3 = `# sent_id = mst-0001
# text = Peşreve başlamalı.
"<Peşreve>"
	"peşrev" Noun @obl #1->2
"<başlamalı>"
	"başla" Verb SpaceAfter=No @root #2->0
"<.>"
	"." Punc @punct #3->2`;
    const sent = new nx.Sentence(cg3);
  });

  it("from CoNLL-U", () => {
    const nx = require("..");
    const conllu = `# sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1   Кечаень Кечай   N   N   Sem/Ant_Mal|Prop|SP|Gen|Indef   2   obj _   Кечаень
2   сыргозтизь  сыргозтемс  V   V   TV|Ind|Prt1|ScPl3|OcSg3 0   root    _   сыргозтизь
3   налкставтыця    налкставтомс    PRC Prc V|TV|PrcPrsL|Sg|Nom|Indef   4   amod    _   налкставтыця
4   карвот  карво   N   N   Sem/Ani|N|Pl|Nom|Indef  2   nsubj   _   карвот
5   .   .   CLB CLB CLB 2   punct   _   .`;
    const sent = new nx.Sentence(conllu);
  });

  it("from params", () => {
    const nx = require("..");
    const params = [{form: "hello"}, {form: "world"}];
    const sent = new nx.Sentence(params);
  });

  it("from plain text", () => {
    const nx = require("..");
    const text = "this is my test string";
    const sent = new nx.Sentence(text);
  });

  it("from SD", () => {
    const nx = require("..");
    const sd = `He says that you like to swim
ccomp(says, like)
mark(like, that)`;
    const sent = new nx.Sentence(sd);
  });

  it("inspecting", () => {
    const nx = require("..");
    const conllu = `# text = He boued e tebr Mona er gegin.
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
9	.	.	sent	_	_	4	punct	_	_`;
    const sent = new nx.Sentence(conllu);

    expect(sent.comments.length).to.equal(3);
    expect(sent.tokens.length).to.equal(8);
    expect(sent.size).to.equal(10);
  });

  it("converting", () => {
    const nx = require("..");
    const conllu = `# this is my first comment
# here is another comment
1	hello	hello	_	_	_	0	root	_
2	,	,	PUNCT	_	_	1	punct	_	_
3	world	world	_	_	_	1	_	_`;
    const sent = new nx.Sentence(conllu);

    expect(sent.to("apertium stream")).to.equal(undefined);
    expect(sent.to("brackets")).to.deep.equal({
      output: "[root hello [punct ,] [_ world]]",
      loss: ["comments", "lemma", "upostag"]
    });
    expect(sent.to("cg3")).to.deep.equal({
      output:
          "# this is my first comment\n# here is another comment\n\"<hello>\"\n\t\"hello\" @root #1->0\n\"<,>\"\n\t\",\" PUNCT @punct #2->1\n\"<world>\"\n\t\"world\" #3->1",
      loss: []
    });
    expect(sent.to("conllu")).to.deep.equal({
      output:
          "# this is my first comment\n# here is another comment\n1\thello\thello\t_\t_\t_\t0\troot\t_\t_\n2\t,\t,\tPUNCT\t_\t_\t1\tpunct\t_\t_\n3\tworld\tworld\t_\t_\t_\t1\t_\t_\t_",
      loss: []
    });
    /*expect(sent.to('notatrix serial')).to.deep.equal({
      output: { ... },
      loss: []
    });*/
    expect(sent.to("params")).to.deep.equal({
      output: [
        {form: "hello", lemma: "hello", head: "0"},
        {form: ",", lemma: ",", upostag: "PUNCT", head: "1"},
        {form: "world", lemma: "world", head: "1"}
      ],
      loss: ["comments"]
    });
    expect(sent.to("plain text")).to.deep.equal({
      output: "hello, world",
      loss: ["comments", "lemma", "heads", "upostag"]
    });
    expect(sent.to("sd")).to.deep.equal({
      output:
          "# this is my first comment\n# here is another comment\nhello, world\nroot(ROOT, hello)\npunct(hello, ,)\n_(hello, world)",
      loss: ["lemma", "upostag"]
    });
  });
});
