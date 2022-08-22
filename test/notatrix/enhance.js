const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

describe("enhance", () => {
  it(`should write the enhanced dependencies to the deps column`, () => {
    const sent = new nx.Sentence(`# sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1	Кечаень	Кечай	N	N	Sem/Ant_Mal|Prop|SP|Gen|Indef	2	obj	_	Кечаень
2	сыргозтизь	сыргозтемс	V	V	TV|Ind|Prt1|ScPl3|OcSg3	0	root	_	сыргозтизь
3	налкставтыця	налкставтомс	PRC	Prc	V|TV|PrcPrsL|Sg|Nom|Indef	4	amod	_	налкставтыця
4	карвот	карво	N	N	Sem/Ani|N|Pl|Nom|Indef	2	nsubj	_	карвот
5	.	.	CLB	CLB	CLB	2	punct	_	.`);

    expect(sent.options.enhanced).to.equal(false);

    sent.enhance();

    expect(sent.options.enhanced).to.equal(true);
    expect(sent.to("CoNLL-U").output)
        .to.equal(`# sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1	Кечаень	Кечай	N	N	Sem/Ant_Mal|Prop|SP|Gen|Indef	2	obj	2:obj	Кечаень
2	сыргозтизь	сыргозтемс	V	V	TV|Ind|Prt1|ScPl3|OcSg3	0	root	0:root	сыргозтизь
3	налкставтыця	налкставтомс	PRC	Prc	V|TV|PrcPrsL|Sg|Nom|Indef	4	amod	4:amod	налкставтыця
4	карвот	карво	N	N	Sem/Ani|N|Pl|Nom|Indef	2	nsubj	2:nsubj	карвот
5	.	.	CLB	CLB	CLB	2	punct	2:punct	.`);
  });
});
