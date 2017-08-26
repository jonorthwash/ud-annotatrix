QUnit.test( "hello test", function( assert ) {
  assert.ok( 1 == "1", "Passed!" );
});


var conllu = require("conllu");


var cg3ambiguous = `# text = He boued e tebr Mona er gegin.
# text[eng] = Mona eats her food here in the kitchen.
# labels = press_1986 ch_syntax p_197 to_check
"<He>"
	"he" det pos f sp @det #1->2
"<boued>"
	"boued" n m sg @obj #2->4
"<e>"
	"e" vpart obj @aux #3->4
"<tebr>"
	"debriñ" vblex pri p3 sg @root #4->0
"<Mona>"
	"Mona" np ant f sg @nsubj #5->4
"<er>"
	"e" pr @case #6->8
		"an" det def sp @det #7->8
"<gegin>"
	"kegin" n f sg @obl #8->4
	"kegin" n f pl @obl #8->4
"<.>"
	"." sent @punct #9->4`


QUnit.test(cg3ambiguous, function( assert ) {
  assert.ok(CG2conllu(cg3ambiguous) == undefined, "Passed!" );
});


var cg3simple = `"<Патшамен>"
        "патша" n ins @nmod #1->3
"<соғыс>"
        "соғыс" n nom @obj #2->3
"<ашқанда>"
        "аш" v tv ger_past loc @advcl #3->12
"<,>"
        "," cm @punct #4->12
"<ел-жұрт>"
        "ел-жұрт" n nom @conj #5->7
"<,>"
        "," cm @punct #6->7
"<отанымды>"
        "отан" n px1sg acc @obj #7->8
"<қорғауға>"
        "қорға" v tv ger dat @advcl #8->12
"<,>"
        "," cm @punct #9->12
"<біз>"
        "біз" prn pers p1 pl nom @nsubj #10->12
"<соғысқа>"
        "соғыс" n dat @nmod #11->12
"<бардық>"
        "бар" v iv ifi p1 pl @root #12->0
"<.>"
        "." sent @punct #13->12`

var cg3simpleAnswer = `1	Патшамен	патша	n	_	ins	3	nmod	_	_
2	соғыс	соғыс	n	_	nom	3	obj	_	_
3	ашқанда	аш	v	_	tv|ger_past|loc	12	advcl	_	_
4	,	,	cm	_	_	12	punct	_	_
5	ел-жұрт	ел-жұрт	n	_	nom	7	conj	_	_
6	,	,	cm	_	_	7	punct	_	_
7	отанымды	отан	n	_	px1sg|acc	8	obj	_	_
8	қорғауға	қорға	v	_	tv|ger|dat	12	advcl	_	_
9	,	,	cm	_	_	12	punct	_	_
10	біз	біз	prn	_	pers|p1|pl|nom	12	nsubj	_	_
11	соғысқа	соғыс	n	_	dat	12	nmod	_	_
12	бардық	бар	v	_	iv|ifi|p1|pl	0	root	_	_
13	.	.	sent	_	_	12	punct	_	_
`


QUnit.test(cg3simple, function( assert ) {
  assert.ok(CG2conllu(cg3simple) == cg3simpleAnswer, "Passed!" );
});
