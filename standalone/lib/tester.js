'use strict';


// DATA
const TEST_DATA = {
	texts_by_format: {
		Unknown: {
			0: '',
			1: '\n',
			2: ' ',
			3: '\t',
			4: ' \t\n',
			5: '    ',
ambiguous_cg3: `# text = He boued e tebr Mona er gegin.
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
	"." sent @punct #9->4`,

ambiguous_cg3_with_semicolumn: `"<Dlaczego>"
	"dlaczego" adv itg
"<nie>"
	"nie" adv
"<miałem>"
	"mieć" vbhaver impf past p1 m sg
"<wysiąku>"
	"wysiąk" n mi sg loc
;	"wysiąk" n mi sg voc REMOVE:117
"<w>"
	"w" pr
"<kolanie>"
	"kolano" n nt sg loc
"<?>"
	"?" sent`

		},
		'plain text': {
			0: 'this is a test',
			1: 'this is a test.',
			2: 'this is a test...',
			3: 'this is a test?',
			4: '\tthis is a test',
			5: 'This is my first sentence.  But I also have this sentence.',
			6: 'I have this sentence.  Now I\'m writing a second sentence.  Should I include a third',
			7: 'Yes!? No??',
			8: 'More sentences = more data; ipso facto, yes.'
		},
		Brackets: {
			0: `[root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]`
		},
		SD: {

0: `And Robert the fourth place .
cc(Robert, And)
orphan(Robert, place)
punct(Robert, .)
amod(place, fourth)
det(place, the)`,

1: `ROOT And Robert the fourth place .
root(ROOT, Robert)
cc(Robert, And)
orphan(Robert, place)
punct(Robert, .)
amod(place, fourth)
det(place, the)`,

2: `ROOT I love French fries .
root(ROOT, love)`,

// https://github.com/UniversalDependencies/docs/blob/pages-source/_u-dep/ccomp.md
ccomp_1: `He says that you like to swim
ccomp(says, like)
mark(like, that)`,
ccomp_2: `He says you like to swim
ccomp(says, like)`,
ccomp_3: `The boss said to start digging
ccomp(said, start)
mark(start, to)`,
ccomp_4: `We started digging
xcomp(started, digging)`,
ccomp_5: `The important thing is to keep calm.
ccomp(is, keep)
nsubj(is, thing)`,
ccomp_6: `The problem is that this has never been tried .
ccomp(is, tried)
nsubj(is, problem)`

		},
		'CoNLL-U': {

0: `# sent_id = _
# text = this is a test
1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	test	_	_	_	_	_	_	_	_`,

1: `1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	test	_	_	_	_	_	_	_	_`,

cat_ancora: `# url = https://raw.githubusercontent.com/UniversalDependencies/UD_Catalan-AnCora/dev/ca_ancora-ud-test.conllu
# sent_id = test-s1
# text = El darrer número de l'Observatori del Mercat de Treball d'Osona inclou un informe especial sobre la contractació a través de les empreses de treball temporal, les ETT.
# orig_file_sentence 001#1
1	El	el	DET	DET	Definite=Def|Gender=Masc|Number=Sing|PronType=Art	3	det	_	_
2	darrer	darrer	ADJ	ADJ	Gender=Masc|Number=Sing|NumType=Ord	3	amod	_	_
3	número	número	NOUN	NOUN	Gender=Masc|Number=Sing	13	nsubj	_	_
4	de	de	ADP	ADP	AdpType=Prep	6	case	_	_
5	l'	el	DET	DET	Definite=Def|Number=Sing|PronType=Art	6	det	_	SpaceAfter=No
6	Observatori	Observatori	PROPN	PROPN	_	3	nmod	_	MWE=Observatori_del_Mercat_de_Treball_d'_Osona|MWEPOS=PROPN
7	del	del	ADP	ADP	AdpType=Preppron|Gender=Masc|Number=Sing	8	case	_	_
8	Mercat	Mercat	PROPN	PROPN	_	6	flat	_	_
9	de	de	ADP	ADP	AdpType=Prep	10	case	_	_
10	Treball	Treball	PROPN	PROPN	_	6	flat	_	_
11	d'	d'	ADP	ADP	AdpType=Prep	12	case	_	SpaceAfter=No
12	Osona	Osona	PROPN	PROPN	_	6	flat	_	_
13	inclou	incloure	VERB	VERB	Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin	0	root	_	_
14	un	un	NUM	NUM	Gender=Masc|Number=Sing|NumType=Card	15	nummod	_	_
15	informe	informe	NOUN	NOUN	Gender=Masc|Number=Sing	13	obj	_	_
16	especial	especial	ADJ	ADJ	Number=Sing	15	amod	_	_
17	sobre	sobre	ADP	ADP	AdpType=Prep	19	case	_	_
18	la	el	DET	DET	Definite=Def|Gender=Fem|Number=Sing|PronType=Art	19	det	_	_
19	contractació	contractació	NOUN	NOUN	Gender=Fem|Number=Sing	15	nmod	_	_
20	a	a	ADP	ADP	AdpType=Prep	24	case	_	MWE=a_través_de|MWEPOS=ADP
21	través	través	NOUN	NOUN	_	20	fixed	_	_
22	de	de	ADP	ADP	AdpType=Prep	20	fixed	_	_
23	les	el	DET	DET	Definite=Def|Gender=Fem|Number=Plur|PronType=Art	24	det	_	_
24	empreses	empresa	NOUN	NOUN	Gender=Fem|Number=Plur	19	nmod	_	_
25	de	de	ADP	ADP	AdpType=Prep	26	case	_	_
26	treball	treball	NOUN	NOUN	Gender=Masc|Number=Sing	24	nmod	_	_
27	temporal	temporal	ADJ	ADJ	Number=Sing	26	amod	_	SpaceAfter=No
28	,	,	PUNCT	PUNCT	PunctType=Comm	30	punct	_	_
29	les	el	DET	DET	Definite=Def|Gender=Fem|Number=Plur|PronType=Art	30	det	_	_
30	ETT	ETT	PROPN	PROPN	_	24	appos	_	SpaceAfter=No
31	.	.	PUNCT	PUNCT	PunctType=Peri	13	punct	_	_`,

with_tabs: `#sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1	Кечаень	Кечай	N	N	Sem/Ant_Mal|Prop|SP|Gen|Indef	2	obj	_	Кечаень
2	сыргозтизь	сыргозтемс	V	V	TV|Ind|Prt1|ScPl3|OcSg3	0	root	_	сыргозтизь
3	налкставтыця	налкставтомс	PRC	Prc	V|TV|PrcPrsL|Sg|Nom|Indef	4	amod	налкставтыця
4	карвот	карво	N	N	Sem/Ani|N|Pl|Nom|Indef	2	nsubj	_	карвот
5	.	.	CLB	CLB	CLB	2	punct	_	.`,

without_tabs: `#sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1 Кечаень Кечай N N Sem/Ant_Mal|Prop|SP|Gen|Indef 2 obj _ Кечаень
2 сыргозтизь сыргозтемс V V TV|Ind|Prt1|ScPl3|OcSg3 0 root _ сыргозтизь
3 налкставтыця налкставтомс PRC Prc V|TV|PrcPrsL|Sg|Nom|Indef 4 amod налкставтыця
4 карвот карво N N Sem/Ani|N|Pl|Nom|Indef 2 nsubj _ карвот
5 . . CLB CLB CLB 2 punct _ .`,

from_cg3_with_semicolumn: `1	Siedzieliśmy	siedzieć	vblex	_	impf|past|p1|m|pl	_	_	_	_
2	w	w	pr	_	_	_	_	_	_
3	moim	mój	prn	_	pos|mi|sg|loc	_	_	_	_
4	pokoju	pokój	n	_	mi|sg|loc	_	_	_	_
5	,	,	cm	_	_	_	_	_	_
6	paląc	palić	vblex	_	impf|pprs|adv	_	_	_	_
7	i	i	cnjcoo	_	_	_	_	_	_
8	rozmawiając	rozmawiać	vblex	_	impf|pprs|adv	_	_	_	_
9	o	o	pr	_	_	_	_	_	_
10	tem	to	prn	_	dem|mi|sg|loc	_	_	_	_
11	,	,	cm	_	_	_	_	_	_
12	jak	jak	rel	_	adv	_	_	_	_
13	marni	marny	adj	_	sint|mp|pl|nom	_	_	_	_
14	jesteśmy	być	vbser	_	pres|p1|pl	_	_	_	_
15	,	,	cm	_	_	_	_	_	_
16	marni	marny	adj	_	sint|mp|pl|nom	_	_	_	_
17	z	z	pr	_	_	_	_	_	_
18	lekarskiego	lekarski	adj	_	mi|sg|gen	_	_	_	_
19	punktu	punkt	n	_	mi|sg|gen	_	_	_	_
20	widzenia	widzieć	vblex	_	impf|ger|nt|sg|gen	_	_	_	_
21	chcę	chcieć	vblex	_	impf|pres|p1|sg	_	_	_	_
22	powiedzieć	powiedzieć	vblex	_	perf|inf	_	_	_	_
23	,	,	cm	_	_	_	_	_	_
24	naturalnie	naturalnie	adv	_	sint	_	_	_	_
25	.	.	sent	_	_	_	_	_	_`,

from_cg3_simple: `1	Патшамен	патша	n	_	ins	3	nmod	_	_
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
`,

from_cg3_with_spans: `# text = He boued e tebr Mona er gegin.
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
9	.	.	sent	_	_	4	punct	_	_
`

		},
		CG3: {/* detectFormat() is having trouble with CG3 :(

kdt_tagged_1: `# https://github.com/apertium/apertium-kaz/blob/master/texts/kdt.tagged.txt
"<Өскеменнің>"
	"Өскемен" np top gen @nmod:poss #1->3
"<ар>"
	"ар" adj @amod #2->3
"<жағында>"
	"жақ" n px3sp loc @conj #3->7
"<,>"
	"," cm @punct #4->7
"<Бұқтырманың>"
	"Бұқтырма" np top gen @nmod:poss #5->7
"<оң>"
	"оң" adj @amod #6->7
"<жағында>"
	"жақ" n px3sp loc @nmod #7->11
"<әлемге>"
	"әлем" n dat @nmod #8->9
"<аян>"
	"аян" adj @acl #9->10
"<Алтай>"
	"Алтай" np top nom @nsubj #10->11
"<бар>"
	"бар" adj @root #11->0
		"е" cop aor p3 sg @cop #12->11
"<.>"
	"." sent @punct #13->11`,

kdt_tagged_2: `# https://github.com/apertium/apertium-kaz/blob/master/texts/kdt.tagged.txt
"<Аттан>"
	"аттан" v iv imp p2 sg @root #1->0
"<!>"
	"!" sent @punct #2->1`,

kdt_tagged_3: `# https://github.com/apertium/apertium-kaz/blob/master/texts/kdt.tagged.txt
"<Манағы>"
	"манағы" det dem @det #1->3
"<ала>"
	"ала" adj @amod #2->3
"<атты>"
	"атты" adj subst nom @nsubj #3->4
"<кім>"
	"кім" prn itg nom @root #4->0
		"е" cop aor p3 sg @cop #5->4
"<?>"
	"?" sent @punct #6->4`,

0: `"<Патшамен>"
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
        "." sent @punct #13->12`,

1: `# text = He boued e tebr Mona er gegin.
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
"<.>"
	"." sent @punct #9->4`,

2: `# text = He boued e tebr Mona er gegin.
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
	"." sent @punct #9->4`,

with_semicolumn: `
"<Siedzieliśmy>"
	"siedzieć" vblex impf past p1 m pl
"<w>"
	"w" pr
"<moim>"
;   "mój" prn pos mi sg loc
"<pokoju>"
	"pokój" n mi sg loc
"<,>"
	"," cm
"<paląc>"
	"palić" vblex impf pprs adv
"<i>"
	"i" cnjcoo
"<rozmawiając>"
	"rozmawiać" vblex impf pprs adv
"<o>"
	"o" pr
"<tem>"
	"to" prn dem mi sg loc
"<,>"
	"," cm
"<jak>"
	"jak" rel adv
"<marni>"
	"marny" adj sint mp pl nom
"<jesteśmy>"
	"być" vbser pres p1 pl
"<,>"
	"," cm
"<marni>"
	"marny" adj sint mp pl nom
"<z>"
	"z" pr
"<lekarskiego>"
	"lekarski" adj mi sg gen
"<punktu>"
	"punkt" n mi sg gen
"<widzenia>"
;   "widzieć" vblex impf ger nt sg gen
"<chcę>"
	"chcieć" vblex impf pres p1 sg
"<powiedzieć>"
	"powiedzieć" vblex perf inf
"<,>"
	"," cm
"<naturalnie>"
	"naturalnie" adv sint
"<.>"
	"." sent`,

simple: `"<Патшамен>"
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
	"." sent @punct #13->12`,

with_spans: `# text = He boued e tebr Mona er gegin.
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
"<.>"
	"." sent @punct #9->4`,

apertium_kaz_1: `# https://bpaste.net/show/be7c03e6213e
"<Чау>"
	"*Чау"
"<->"
	"х" guio
	"-" guio
"<чау>"
	"*чау"
"<шығу>"
	"шығу" n attr
	"шық" v tv ger nom
	"шық" v iv ger nom
	"шығу" n nom
;	"шығу" n nom
;		"е" cop aor p3 pl REMOVE:294
;	"шығу" n nom
;		"е" cop aor p3 sg REMOVE:294
;	"шық" vaux ger nom REMOVE:766
"<тегінен>"
	"тек" n px3sp abl
;	"тек" n px3sp abl
;		"е" cop aor p3 pl REMOVE:294
;	"тек" n px3sp abl
;		"е" cop aor p3 sg REMOVE:294
"<шпицтер>"
	"*шпицтер"
"<тобына>"
	"топ" n px3sp dat
"<жатады>"
	"жат" v iv aor p3 sg
;	"жат" vaux aor p3 pl REMOVE:766
;	"жат" vaux aor p3 sg REMOVE:766
;	"жат" v iv aor p3 pl REMOVE:846
"<.>"
	"." sent`,

apertium_kaz_2: `# https://bpaste.net/show/be7c03e6213e
"<Қанында>"
	"қан" n px3sp loc
;	"қан" n px3sp loc
;		"е" cop aor p3 pl REMOVE:294
;	"қан" n px3sp loc
;		"е" cop aor p3 sg REMOVE:294
"<тибет>"
	"*тибет"
"<итінің>"
	"ит" n px3sp gen
"<(>"
	"(" lpar
"<мастиф>"
	"*мастиф"
"<)>"
	")" rpar
"<қаны>"
	"қан" n px3sp nom
;	"қан" n px3sp nom
;		"е" cop aor p3 pl REMOVE:294
;	"қан" n px3sp nom
;		"е" cop aor p3 sg REMOVE:294
"<бар>"
	"бар" adj SELECT:1118
	"бар" adj subst nom SELECT:1118
		"е" cop aor p3 sg
	"бар" adj subst nom SELECT:1118
	"бар" adj SELECT:1118
		"е" cop aor p3 sg
;	"бар" n attr REMOVE:567
;	"бар" adj
;		"е" cop aor p3 pl REMOVE:853
;	"бар" n nom
;		"е" cop aor p3 pl REMOVE:853
;	"бар" adj subst nom
;		"е" cop aor p3 pl REMOVE:853
;	"бар" n nom SELECT:1118
;	"бар" det qnt SELECT:1118
;	"бар" v iv imp p2 sg SELECT:1118
;	"бар" n nom SELECT:1118
;		"е" cop aor p3 sg
"<деген>"
	"де" v tv gpr_past SELECT:813
	"де" v tv gpr_past subst nom SELECT:813
;	"де" v tv ger_past nom SELECT:813
;	"де" v tv past p3 pl SELECT:813
;	"де" v tv past p3 sg SELECT:813
"<тұжырым>"
	"тұжырым" n nom
	"тұжырым" n attr
;	"тұжырым" n nom
;		"е" cop aor p3 pl REMOVE:294
;	"тұжырым" n nom
;		"е" cop aor p3 sg REMOVE:294
"<бар>"
	"бар" adj
	"бар" n nom
	"бар" adj
		"е" cop aor p3 sg
	"бар" adj subst nom
		"е" cop aor p3 sg
	"бар" adj subst nom
	"бар" v iv imp p2 sg
	"бар" n nom
		"е" cop aor p3 sg
;	"бар" det qnt REMOVE:551
;	"бар" n attr REMOVE:567
;	"бар" adj subst nom
;		"е" cop aor p3 pl REMOVE:853
;	"бар" adj
;		"е" cop aor p3 pl REMOVE:853
;	"бар" n nom
;		"е" cop aor p3 pl REMOVE:853
"<.>"
	"." sent`

		*/}
	}
};


























/*
 * Tester object
 *
 * put unit tests inside here as functions, and then add the function call to
 * the all() function ... to invoke, use window.test.all() or test.all()
 *
 * also implements an assert() function, which throws AssertionError exceptions
 */
class Tester extends Object {
	constructor() { super(); }


	/*
	 * simple assert function
	 */
	assert(expression, message='') {
		if (!expression)
			throw new AssertionError(message);
		log.debug(`OK: Tester.assert() got a truthy expression (message: "${message}")`);
	}

	arraysEqual(arr1, arr2) {
		if (arr1.length !== arr2.length)
			return false
		for (let i=0, l=arr1.length; i<l; i++) {
			if (arr1[i] !== arr2[i])
				return false
		}
		return true;
	}




	/*
	 * TEST functions
	 */
	all() {
		log.out('\nExecuting Tester.all()');

		this.tester();
		this.logger();
		this.errors();
		this.buttons();
		this.rangeExclusive();
		this.detectFormat();
		this.converters();

		log.out('\nTester.all(): all tests passed!\n');
	}
	tester() {
		log.out('\nExecuting Tester.tester()');

		this.assert(1==1, `1==1`);
		this.assert(1=='1', `1=='1'`);
		this.assert(1!=='1', `1!=='1'`);
		this.assert(undefined==null, `undefined==null`);
		this.assert(undefined!==null, `undefined!==null`);
		this.assert(0==false, `0==false`);
		this.assert(0!==false, `0!==false`);
		this.assert(1==true, `1==true`);
		this.assert((()=>{})()==undefined, `(()=>{})()==undefined`);
		this.assert((()=>{})()===undefined, `(()=>{})()===undefined`);
		this.assert('foo'!='bar', `'foo'!=bar`);

	}
	logger() {
		log.out('\nExecuting Tester.logger()');

		const testMessage = 'This is the logger test message';
		const loggers = [ log, // defined in annotator.js
			new Logger('CRITICAL'),
			new Logger('ERROR'),
			new Logger('WARN'),
			new Logger('INFO'),
			new Logger('DEBUG'),
			new Logger('INVALID') ];

		$.each(loggers, (i, logger) => {

			logger.out(`\nNow testing logger: ${logger}`);
			logger.critical(testMessage);
			logger.error(testMessage);
			logger.warn(testMessage);
			logger.info(testMessage);
			logger.debug(testMessage);

		});
	}
	errors() {
		log.out('\nExecuting Tester.errors()');

		const testMessage = 'This is the error test message';
		const errors = [
			new Error(testMessage),
			new ReferenceError(testMessage),
			new TypeError(testMessage),
			new SyntaxError(testMessage),
			new AnnotatrixError(testMessage),
			new AssertionError(testMessage),
			new GUIError(testMessage),
			new ParseError(testMessage)
		];

		$.each(errors, (i, error) => {
			try {
				throw error;
			} catch (e) {
				console.log(`Caught ${e.name} with message "${e.message
					}", (custom:${e instanceof AnnotatrixError ? 'yes' : 'no'})`);
			}
		});
	}
	buttons() {
		log.out('\nExecuting Tester.buttons()');

		const buttons = [
			$('#prevSenBtn'),
			$('#nextSenBtn'),
			$('#remove'),
			$('#add'),
			$('#upload'),
			$('#exportBtn'),
			$('#clearBtn'),
			$('#printBtn'),
			$('#btnUndo'),
			$('#btnRedo'),
			$('#helpBtn'),
			$('#settingsBtn'),
			$('#viewOther'),
			$('#viewConllu'),
			$('#viewCG'),
			$('#tableViewBtn'),
			$('#codeVisibleBtn'),
			$('#RTL'),
			$('#vertical'),
			$('#enhanced')
		];

		$.each(buttons, (i, button) => {
			//button.click();
		});
	}
	rangeExclusive() {
		log.out('\nExecuting Tester.rangeExclusive()');

		const inputs = [
				{ params:[0,10,1], ret:[1,2,3,4,5,6,7,8,9] },
				{ params:[0,10,2], ret:[1,3,5,7,9] },
				{ params:[1,10,2], ret:[2,4,6,8] },
				{ params:[0,10,3], ret:[1,4,7] },
				{ params:[10,0,1], ret:[1,2,3,4,5,6,7,8,9] },
				{ params:[10,0,2], ret:[1,3,5,7,9] },
				{ params:[10,1,2], ret:[2,4,6,8] },
				{ params:[10,0,3], ret:[1,4,7] },
				{ params:[6], ret:[1,2,3,4,5] },
				{ params:[3,6], ret:[4,5] },
				{ params:[6,3], ret:[4,5] },
				{ params:[], ret:[] }
		];

		$.each(inputs, (i, input) => {
				const ret = rangeExclusive(...input.params),
						message = `expected: [${input.ret.join(',')}], got: [${ret.join(',')}]`;
				this.assert(this.arraysEqual(ret, input.ret), message);
		});
	}
	detectFormat() {
		log.out('\nExecuting Tester.detectFormat()');

		$.each(TEST_DATA.texts_by_format, (format, texts) => {
			$.each(texts, (identifier, text) => {
				const ret = detectFormat(text),
						message = `expected (${format}:${identifier}) to be detected as "${format}", but got "${ret}".`;
				this.assert(ret === format, message);
			});
		});
	}
	converters() {
		log.out('\nExecuting Tester.converters()');

		$.each(TEST_DATA.texts_by_format, (format, texts) => {
			$.each(texts, (identifier, text) => {

				// check plain text converter
				log.out('\nTester.converters(): checking plain text converter');
				const toPlainText = convert2PlainText(text);
				if (format === 'Unknown') {
					this.assert(toPlainText === null, `expected (${format}:${identifier}) to fail to convert.`);
				} else {
					const toPlainTextFormat = detectFormat(toPlainText);
					this.assert(toPlainTextFormat === 'plain text', `expected (${format}:${identifier}) to be detected as "plain text", but got "${toPlainTextFormat}".`);
				}


				// check CoNLL-U converter
				log.out('\nTester.converters(): checking CoNLL-U converter');
				const toConllu = convert2Conllu(text);
				if (format === 'Unknown') {
					this.assert(toConllu === null, `expected (${format}:${identifier}) to fail to convert.`);
				} else if (format !== 'Brackets') {
					const toConlluFormat = detectFormat(toConllu);
					this.assert(toConlluFormat === 'CoNLL-U', `expected (${format}:${identifier}) to be detected as "CoNLL-U", but got "${toConlluFormat}".`);
				}


				// check CG3 converter
				log.out('\nTester.converters(): checking CG3 converter');
				const toCG3 = convert2cg3(text);
				if (format === 'Unknown') {
					this.assert(toCG3 === null, `expected (${format}:${identifier}) to fail to convert.`);
				} else {				
					const toCG3Format = detectFormat(toCG3);
					//this.assert(toCG3Format === 'CG3', `expected (${format}:${identifier}) to be detected as "CG3", but got "${toCG3Format}".`);
				}

			});
		});
	}
}
