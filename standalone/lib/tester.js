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

/* how to handle these ones?
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
	"?" sent` */

		},
		'plain text': {
			0: 'this is a test',
			1: 'this is a test.',
			2: 'this is a test...',
			3: 'this is a test?',
			4: '\tthis is a test',
			5: 'More sentences = more data; ipso facto, yes.'
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
`,

rueter_long: `# sent_id = BryzhinskijMixail_Kirdazht_manu:3859
# text = Но зярс валгсь , зярс панжтнесь ды мекев парсте пекстнесь веле кенкшенть , кужо кенкшенть , куро кенкшенть ды эсест юртс совамо кенкшенть эрьва лисицянтень совицянтень те свал тейнема , кенкштне свал пекстазь улезт ; панжтнесызь келес ансяк валске марто ды чопоньбелев — ракшань ливтема совавтома шкане , куймесь таго стакалгадсь .
# text_en = But by the time he got down the hill, opened and closed the village gate, the lane gate, the cluster gate and the one to their own home (something everyone coming or going had to do, so the gates would always be closed; they were only opened in the morning and at dusk for taking out and letting in the cattle), the wicker of clay had grown heavy again.
# text_fi = Kun Ketšai tuli mäeltä alas, avasi ja sulki huolellisesti kyläveräjänsä, ??aukio/kenttäveräjän, kujaveräjän ja oman kotiveräjän, savikontti ehti taas alkaa painaa hänen selkäänsä. (Kaikkien kävijöiden tulee tehdä näin, jotta veräjät olisivat aina kiinni, veräjäthän pidetään selkosen selällään vain aamulla ja illansuussa, kun karjaa ajetaan laitumelle tai kotiin.)
1 Но но CCONJ CC _ 3 cc _ _
2 зярс зярс ADV Adv|Der/Ill|Adv|Sem/Time Derivation=Ill|AdvType=Tim 3 mark _ _
3 валгсь валгомс VERB V|Ind|Prt1|ScSg3 Mood=Ind|Number[subj]=Sing|Person[subj]=3|Tense=Prt1 55 advcl _ SpaceAfter=No
4 , , PUNCT CLB _ 6 punct _ _
5 зярс зярс ADV Adv|Der/Ill|Adv|Sem/Time Derivation=Ill|AdvType=Tim 6 mark _ _
6 панжтнесь панжтнемс VERB V|Ind|Prt1|ScSg3 Mood=Ind|Number[subj]=Sing|Person[subj]=3|Tense=Prt1 3 conj _ _
7 ды ды CCONJ CC _ 10 cc _ _
8 мекев мекев ADV Adv|Lat|Sg|Nom|Indef Case=Lat|Case=Nom|Definite=Ind|Number=Sing 10 advmod _ _
9 парсте парсте ADV Adv|Manner AdvType=Man 10 advmod _ _
10 пекстнесь пекстнемс VERB V|Ind|Prt1|ScSg3 Mood=Ind|Number[subj]=Sing|Person[subj]=3|Tense=Prt1 3 conj _ _
11 веле веле NOUN N|Sem/Inanim_Cnt|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing 10 obj _ _
12 кенкшенть кенкш NOUN N|Sem/Inanim_Cnt|Sg|Gen|Def Case=Gen|Definite=Def|Number=Sing 11 goeswith _ SpaceAfter=No
13 , , PUNCT CLB _ 15 punct _ _
14 кужо кужо NOUN N|Sem/Inanim_Cnt|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing 12 conj _ _
15 кенкшенть кенкш NOUN N|Sem/Inanim_Cnt|Sg|Gen|Def Case=Gen|Definite=Def|Number=Sing 14 goeswith _ SpaceAfter=No
16 , , PUNCT CLB _ 18 punct _ _
17 куро куро NOUN N|Sem/Inanim_Cnt|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing 12 conj _ _
18 кенкшенть кенкш NOUN N|Sem/Inanim_Cnt|Sg|Gen|Def Case=Gen|Definite=Def|Number=Sing 17 goeswith _ _
19 ды ды CCONJ CC _ 23 cc _ _
20 эсест эсь PRON Pron|Refl|Pl3|Gen|Variant=Short Case=Gen|Number=Plur|Person=3|PronType=Refl|Variant=Short 22 nmod _ _
21 юртс юрт NOUN N|Sem/Inanim_Cnt|SP|Ill|Indef Case=Ill|Definite=Ind|Number=Plur,Sing 20 case _ _
22 совамо совамо NOUN N|IV|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing|Valency=1 23 compound _ _
23 кенкшенть кенкш NOUN N|Sem/Inanim_Cnt|Sg|Gen|Def Case=Gen|Definite=Def|Number=Sing 12 conj _ _
24 ( ( PUNCT PUNCT _ 29 punct _ SpaceAfter=No
25 эрьва эрьва DET Det|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing 26 det _ _
26 лисицянтень-совицянтень лисицят-совицят NOUN N|V|NomAg|Sg|Dat|Def Case=Dat|Definite=Def|Derivation=NomAg|Number=Sing 29 obl _ _
27 те те PRON Pron|Dem|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing|PronType=Dem 29 nsubj _ _
28 свал свал ADV Adv|Tot|Sem/Time_dur PronType=Tot|PronType=Tot 29 advmod _ _
29 тейнема тейнемc VERB V|TV|Oblig|Clitic=Cop|Prs|ScSg3 Valency=2|VerbForm=Oblig|Clitic=Cop|Number[subj]=Sing|Person[subj]=3|Tense=Pres 3 parataxis _ SpaceAfter=No
30 , , PUNCT CLB _ 33 punct _ _
31 кенкштне кенкш NOUN N|Sem/Inanim_Cnt|Pl|Nom|Def Case=Nom|Definite=Def|Number=Plur 34 nsubj _ _
32 свал свал ADV Adv|Tot|Sem/Time_dur PronType=Tot|PronType=Tot 33 advmod _ _
33 пекстазь пекстамс VERB V|Der/Озь|Ger Derivation=Ozj|VerbForm=Conv 29 ccomp _ _
34 улезт улемс AUX V|IV|Opt|ScPl3 Mood=Opt|Number[subj]=Plur|Person[subj]=3|Valency=1 33 cop _ SpaceAfter=No
35 ; ; PUNCT CLB _ 29 punct _ _
36 панжтнесызь панжтнемс VERB V|Ind|Prs|ScPl3|Obj3 Mood=Ind|Number[subj]=Plur|Person[subj]=3|Tense=Pres|Obj3 29 conj _ _
37 келес келес ADV Adv Adv 36 advmod _ _
38 ансяк ансяк ADV Adv Adv 39 advmod _ _
39 валске валске NOUN N|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing 36 obl _ _
40 марто марто ADP Adp|Po AdpType=Post 39 case _ _
41 ды ды CCONJ CC _ 42 cc _ _
42 чопоньбелев чопоньбелев ADV Adv|Lat Case=Lat 39 conj _ _
43 — — PUNCT CLB _ 46 punct _ _
44 ракшань ракша NOUN N|Sem/Anim_Cnt|SP|Gen|Indef Case=Gen|Definite=Ind|Number=Plur,Sing 45 nmod:gobj _ _
45 ливтема-совавтома ливтема-совавтома NOUN N|Sg|Nom|Indef Case=Nom|Definite=Ind|Number=Sing 36 nmod _ _
46 шкане шка NOUN N|Sem/Time|SP|Temp|Indef Case=Temp|Definite=Ind|Number=Plur,Sing 39 conj _ SpaceAfter=No
47 ) ) PUNCT PUNCT _ 29 punct _ SpaceAfter=No
48 , , PUNCT CLB _ 29 punct _ _
49 куймесь куйме NOUN N|Sem/Inanim_Cnt|Sg|Nom|Def Case=Nom|Definite=Def|Number=Sing 51 nsubj _ _
50 таго таго ADV Adv|Sem/Time AdvType=Tim 51 advmod _ _
51 стакалгадсь стакалгадомс VERB V|Ind|Prt1|ScSg3 Mood=Ind|Number[subj]=Sing|Person[subj]=3|Tense=Prt1 0 root _ SpaceAfter=No
52 . . PUNCT CLB _ 51 punct _ _`

		},
		CG3: {

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

simple_with_comments: `# comment #1
# comment #2
"<Патшамен>"
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

		}
	},

	conversion_testing: {

wanna_cg3: `
"<I>"
	"I" prn subj p1 mf sg
"<wanna>"
	"want# to" vbmod pres
	"want" vblex pres
		"to" pr
	"want" vblex inf
		"to" pr
"<skate>"
	"skate" vblex inf SELECT:102
	"skate" vblex pres SELECT:102
;	"skate" n sg SELECT:102
;	"skate" vblex imp SELECT:102 REMOVE:169
"<to>"
	"to" pr
"<the>"
	"the" det def sp
"<beach>"
	"beach" n sg
"<every day>"
	"every day" adv
	"every" det ind sg
		"day" n sg
"<.>"
	"." sent`,

wanna_conllu_1: `
1	I	I	_	prn	subj|p1|mf|sg	_	_	_	_
2	wanna	want# to	_	vbmod	pres	_	_	_	_
3	skate	skate	_	vblex	inf	_	_	_	_
4	to	to	_	pr	_	_	_	_	_
5	the	the	_	det	def|sp	_	_	_	_
6	beach	beach	_	n	sg	_	_	_	_
7-8	every day	_	_	_	_	_	_	_	_
7	every	every	_	det	ind|sg	_	_	_	_
8	day	day	_	n	sg	_	_	_	_
9	.	.	_	sent	_	_	_	_	_`,

wanna_conllu_2: `
1	I	I	_	prn	subj|p1|mf|sg	_	_	_	_
2-3	wanna	_	_	_	_	_	_	_	_
2	wanna	want	_	vblex	pres	_	_	_	_
3	wanna	to	_	pr	_	_	_	_	_
4	skate	skate	_	vblex	inf	_	_	_	_
5	to	to	_	pr	_	_	_	_	_
6	the	the	_	det	def|sp	_	_	_	_
7	beach	beach	_	n	sg	_	_	_	_
8-9	every day	_	_	_	_	_	_	_	_
8	every	every	_	det	ind|sg	_	_	_	_
9	day	day	_	n	sg	_	_	_	_
10	.	.	_	sent	_	_	_	_	_`,

wanna_conllu_3: `
1	I	I	_	prn	subj|p1|mf|sg	_	_	_	_
2-3	wanna	_	_	_	_	_	_	_	_
2	wanna	want	_	vblex	pres	_	_	_	_
3	wanna	to	_	pr	_	_	_	_	_
4	skate	skate	_	vblex	inf	_	_	_	_
5	to	to	_	pr	_	_	_	_	_
6	the	the	_	det	def|sp	_	_	_	_
7	beach	beach	_	n	sg	_	_	_	_
8	every day	every day	_	adv	_	_	_	_	_
9	.	.	_	sent	_	_	_	_	_`

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
	constructor() {
		super();

		// internal helper function
		this.utils = {

			delimitSets: {
				text: [ '.', '!', '?' ],
				other: [ '\n\n', '\n\n\n', '\n\n\n\n' ],
				invalid: [ ';', ',', ':', '\n', '\t', '\t\t' ],
			},

			sleep: (ms) => {
			  return new Promise(resolve => setTimeout(resolve, ms));
			},
			checkCounts: (current, total) => {

				(() => {
					const sentences = _.sentences.length,
							formats = _.formats.length;
					this.assert(sentences === formats, `inconsistent: got ${sentences} sentences and ${formats} formats`);
				})();

				((expected) => {
					const actual = _.current;
					this.assert(expected === actual, `current: expected index at ${expected}, got ${actual}`);
				})(current);

				((expected) => {
					const actual = _.sentences.length;
					this.assert(expected === actual, `total: expected ${expected}, got ${actual}`);
				})(total);

			},
			randomInt: (min, max) => {
				if (max === undefined) {
					max = min;
					min = 0;
				}
				return Math.floor(Math.random() * max) + min;
			},
			sample: (obj, times) => {

				times = times || 1;

				let ret = [];
				for (let i=0; i < times; i++) {
					const key = Array.isArray(obj)
						? this.utils.randomInt(obj.length)
						: Object.keys(obj)[this.utils.randomInt(Object.keys(obj).length)];
					ret.push(obj[key]);
				}

				return ret;
			},
			randomize: (maxSize) => {

				maxSize = maxSize || 1;

				let ret = [];
				for (let size=1; size <= maxSize; size++) {
					$.each(TEST_DATA.texts_by_format, (format, texts) => {
						ret.push({ format:format, text:this.utils.sample(texts, size) });
					});
				}

				return ret;
			},
			jumpToSentence: (str) => {
				$('#current-sentence').val(str);
				goToSentence();
			},
			splitAndSet: (str) => {
				_.reset();
				$('#text-data').val(str);
				return parseTextData();
			},
			matchAndTrim: (str) => {
				const matched = str.match(/[^.!?]+[.!?]*/g);
				return matched === null
					? [ str.trim() ]
					: matched.map((chunk) => {
						return chunk.trim();
					});
			},
			splitAndTrim: (str) => {
				return str.split(/\n{2,}/g).map((chunk) => {
					return chunk.trim();
				});
			},
			simKeyup: (selector, char, cursor) => {

				if (cursor !== undefined)
						this.utils.setCursor(selector, cursor);

				char = char.slice(0, 1);

				const	which = {
						'\n': KEYS.ENTER,
						'ESC': KEYS.ESC,
						'\t': KEYS.TAB
					}[char];

				if (!(char === '\n'
					&& (_.formats[_.current] === 'CoNLL-U'
						|| _.formats[_.current] === 'CG3')))
					this.utils.insertChar(selector, char);

				if (selector === '#text-data') {
					onEditTextData({ which: which });
				} else if (selector === '#table-data') {
					onEditTableData({ which: which });
				}
			},
			insertChar: (selector, char) => {
				const target = $(selector),
					start = target.prop('selectionStart'),
					end = target.prop('selectionEnd'),
					current = target.val();

				target
					.val(`${current.slice(0,start)}${char}${current.slice(end)}`)
					.prop('selectionStart', start + 1)
					.prop('selectionEnd', end + 1);
			},
			setCursor: (selector, start, end) => {
				start = start || 0;
				end = end || start;

				$(selector)
					.prop('selectionStart', start)
					.prop('selectionEnd', end);
			},
			isValid: (format, text) => {

				switch (format) {
					case ('CoNLL-U'):
						let tokenId = 0;
						text.split('\n').map((line, i) => {

		 					// ignore empty lines as artifacts from the splitting
							if (line.length === 0)
								return;

							// comments should only occur at the beginning
							if (line.startsWith('#')) {
								this.assert(tokenId === 0, `invalid CoNLL-U: comment found after content start (line: "${line}")`);
								return;
							}

							// get the number ranges at the start
							let matches = line.match(/^[0-9-]+/);
							matches = matches ? matches[0].split('-').map(
								(match) => { return parseInt(match); }) : [0];

							// enforce numbers are in order
							matches.map((match, j) => {
								if (j === 0) {
									this.assert(match === tokenId + 1, `invalid CoNLL-U: expected index to be ${tokenId + 1} (line: "${line}")`);
								} else {
									this.assert(match > tokenId + 1, `invalid CoNLL-U: expected index to be greater than ${tokenId + 1} (line: "${line}")`);
								}
							});

							// only advance our token id if we don't have a range (i.e. "6" and not "6-7")
							if (matches.length === 1)
								tokenId++;
						});
						break;

					case ('CG3'):
						let parsingToken = null;
						text.split('\n').map((line, i) => {

							// ignore empty lines as artifacts from the splitting
							if (line.length === 0)
								return;

							// comments should only occur at the beginning
							if (line.startsWith('#')) {
								this.assert(parsingToken === null, `invalid CG3: comment found after content start (line: "${line}")`);
								return;
							}

							// enforce that we never have consecutive tokens
							if (line.startsWith('"<')) {
								this.assert(parsingToken === false || parsingToken === null,
									`invalid CG3: unable to parse consecutive tokens (line: "${line}")`);
								parsingToken = true;
							} else {
								parsingToken = false;
							}

						});
						break;

				}
			}

		};

		this.tests = {

			tester: () => {
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

			},

			logger: () => {
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
			},

			errors: () => {
				log.out('\nExecuting Tester.errors()');

				const testMessage = 'Tester.errors(): This is the error test message';
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
						log.debug(`Caught ${e.name} with message "${e.message}", (custom:${e instanceof AnnotatrixError ? 'yes' : 'no'})`);
					}
				});
			},

			buttons: () => {
				log.out('\nExecuting Tester.buttons()');

				const buttons = [
					$('#btnPrevSentence'),
					$('#btnNextSentence'),
					$('#btnRemoveSentence'),
					$('#btnAddSentence'),
					$('#btnUploadCorpus'),
					$('#btnExportCorpus'),
					$('#btnDiscardCorpus'),
					$('#btnPrintCorpus'),
					$('#btnUndo'),
					$('#btnRedo'),
					$('#btnHelp'),
					$('#btnSettings'),
					$('#tabOther'),
					$('#tabConllu'),
					$('#tabCG3'),
					$('#btnViewTable'),
					$('#btnViewText'),
					$('#RTL'),
					$('#vertical'),
					$('#enhanced')
				];

				$.each(buttons, (i, button) => {
					//button.click();
				});
			},

			rangeExclusive: () => {
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
			},

			detectFormat: () => {
				log.out('\nExecuting Tester.detectFormat(): Phase 1: basic detecting');

				$.each(TEST_DATA.texts_by_format, (format, texts) => {
					$.each(texts, (identifier, text) => {
						const detected = detectFormat(text),
								message = `expected (${format}:${identifier}) to be detected as "${format}", but got "${detected}".`;
						this.assert(detected === format, message);
					});
				});

				log.out('\nExecuting Tester.detectFormat(): Phase 2: randomized detecting');

				$.each(this.utils.delimitSets, (name, delimiters) => {
					$.each(delimiters, (i, delimiter) => {
						$.each(this.utils.randomize(10), (j, randomized) => {
							if (randomized.format !== 'Unknown') {
								const content = randomized.text.join(delimiter),
									detected = detectFormat(content),
									message = `expected (${content}) to be detected as "${randomized.format}", but got "${detected}".`;
								this.assert(detected === randomized.format, message);
							}
						});
					});
				});
			},

			converters: () => {
				log.out('\nExecuting Tester.converters()');

				const converters = {
					'plain text': convert2PlainText,
					'CoNLL-U': convert2Conllu,
					'CG3': convert2CG3
				};

				let failures = [];

				$.each(converters, (converterFormat, converter) => {
					log.out(`\nTester.converters(): checking ${converterFormat} converter`);

					$.each(TEST_DATA.texts_by_format, (format, texts) => {
						$.each(texts, (textName, text) => {
							log.out(`Tester.converters(): trying to convert text (${format}:${textName}) to ${converterFormat}`);

							const convertedText = converter(text);
							if (format === 'Unknown') {
								this.assert(convertedText === null, `expected (${format}:${textName}) to fail to convert.`);
								failures.push(`${format}:${textName}=>${converterFormat} (expected)`);
							} else if (convertedText === null) {
								log.warn(`Tester.converters(): text (${format}:${textName}) failed to convert to ${converterFormat}`);
								failures.push(`${format}:${textName}=>${converterFormat} (unexpected)`);
							} else if (format === 'Brackets') {
								log.warn('Tester.converters(): skipping all inputs in Brackets format');
								failures.push(`${format}:${textName}=>${converterFormat} (unexpected)`);
							} else {
								const convertedFormat = detectFormat(convertedText);
								this.assert(converterFormat === convertedFormat, `expected (${format}:${textName}) to be detected as "${converterFormat}", got "${convertedFormat}".`);
							}

						});
					});
				});

				log.out(`Tester.converters(): failed to convert the following items:`)
				$.each(failures, (i, failure) => {
					log.out(` - ${failure}`);
				});
			},

			navSentences: () => {
				log.out(`\nExecuting Tester.navSentences()`);

				// need consistent initial environment
				_.reset();
				this.utils.checkCounts(0, 1);

				// insert and remove
				insertSentence();
				this.utils.checkCounts(1, 2);
				removeSentence(null, true);
				this.utils.checkCounts(0, 1);
				removeSentence(null, true);
				this.utils.checkCounts(0, 1);
				removeSentence(null, true);
				this.utils.checkCounts(0, 1);

				// pan with 1 sentence
				prevSentence();
				this.utils.checkCounts(0, 1);

				nextSentence();
				this.utils.checkCounts(0, 1);

				// goto with 1 sentence
				this.utils.jumpToSentence(null);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence(undefined);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence('string');
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence([]);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence({});
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence('2');
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence(3.5);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence(2);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence(1);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence(0);
				this.utils.checkCounts(0, 1);
				this.utils.jumpToSentence(-1);
				this.utils.checkCounts(0, 1);

				// pan with 2 sentences
				insertSentence();
				this.utils.checkCounts(1, 2);
				prevSentence();
				this.utils.checkCounts(0, 2);
				prevSentence();
				this.utils.checkCounts(0, 2);
				nextSentence();
				this.utils.checkCounts(1, 2);
				prevSentence();
				this.utils.checkCounts(0, 2);

				// jump with 2 sentences
				this.utils.jumpToSentence(-1);
				this.utils.checkCounts(0, 2);
				this.utils.jumpToSentence(0);
				this.utils.checkCounts(0, 2);
				this.utils.jumpToSentence(1);
				this.utils.checkCounts(0, 2);
				this.utils.jumpToSentence(2);
				this.utils.checkCounts(1, 2);
				this.utils.jumpToSentence('1');
				this.utils.checkCounts(0, 2);
				this.utils.jumpToSentence(2);
				this.utils.checkCounts(1, 2);
				this.utils.jumpToSentence(3);
				this.utils.checkCounts(1, 2);
				this.utils.jumpToSentence(0);
				this.utils.checkCounts(1, 2);

				_.reset();

			},

			textDataParser: () => {

				log.out(`\nExecuting Tester.textDataParser(): Phase 1: basic text splitting`);
				$.each([
					{ str:'this is the first test', split:['this is the first test'] },
					{ str:'this is, the second', split:['this is, the second'] },
					{ str:'one sentence.', split:['one sentence.'] },
					{ str:'one! two!', split:['one!', 'two!'] },
					{ str:'one. two! three?', split:['one.', 'two!', 'three?'] },
				], (i, datum) => {

					const splitted = this.utils.splitAndSet(datum.str),
						message = `expected '${datum.split.join('\', \'')}'; got '${splitted.join('\', \'')}'`;

					this.assert(this.arraysEqual(datum.split, splitted), message);
					this.utils.checkCounts(0, splitted.length);

				});

				log.out(`\nExecuting Tester.textDataParser(): Phase 2: randomized text splitting`);
				$.each(this.utils.delimitSets, (name, delimiters) => {
					$.each(delimiters, (i, delimiter) => {
						$.each(this.utils.randomize(5), (j, randomized) => {
							const format = randomized.format,
								actual = this.utils.splitAndSet(randomized.text.join(delimiter));

							let expected;
							if (format === 'Unknown') {
								expected = actual; // pass
							} else if (format === 'plain text') {
								expected = this.utils.matchAndTrim(randomized.text.join(delimiter));
							} else {
								expected = this.utils.splitAndTrim(randomized.text.join(delimiter));
							}

							this.assert(this.arraysEqual(expected, actual),
								`expected ${JSON.stringify(expected)}; got ${JSON.stringify(actual)}`);

							this.utils.checkCounts(0, actual.length);

						});
					});
				});

				_.reset();

			},

			onEnter: () => {
				log.out(`\nExecuting Tester.onEnter(): Phase 1: basic enter testing`);

				const data = [
					'Hello world, I am testing'
				];

				$.each(data, (i, datum) => {
					$.each(['#tabText', '#tabConllu', '#tabCG3'], (j, selector) => {
						test.utils.splitAndSet(datum);
						$(selector).click();

						let EOLs = [], acc = 0;
						$.each(_.sentences[_.current].split('\n'), (k, line) => {
							EOLs.push(acc + line.length + k);
							acc += line.length;
						});

						$.each(EOLs.reverse(), (l, eol) => {
							this.utils.simKeyup('#text-data', '\n', eol);
						});
					});
				});

				log.out(`\nExecuting Tester.ontEnter(): Phase 2: randomized enter testing`);

				for (let i=0; i<10; i++) { // repeat tests 10 times
					$.each(this.utils.randomize(), (j, randomized) => { // sample once per format
						const format = randomized.format,
								text = randomized.text.join('');

						if (format === 'Unknown')
							return;

						this.utils.splitAndSet(text);
						for (let k=0; k < 5; k++) { // trying hitting <Enter> multiple times

							const cursor = this.utils.randomInt(_.sentences[_.current].length);
							this.utils.simKeyup('#text-data', '\n', cursor);
							parseTextData();
							this.utils.jumpToSentence(1);

							this.assert(format === _.formats[_.current],
								`expected format to be ${format}, got ${_.formats[_.current]}`);
							this.utils.isValid(format, text);
						}
					});
				}
			},

			tableEditing: () => {

				log.out('\nExecuting Tester.tableEditing()');
				for (let i=0; i<10; i++) { // repeat tests 10 times
					$.each(this.utils.randomize(), (j, randomized) => { // sample once per format
						const format = randomized.format,
							text = randomized.text;

						this.utils.splitAndSet(text);
						toggleTableView(null, true);

						if (format !== 'CoNLL-U') {
							this.assert(_.is_table_view === false, `expected ${format} not to have table view`);
						} else {
							this.assert(_.is_table_view === true, `expected CoNLL-U to have table view available`);
							
						}

					});
				}
			}
		};
	}


	/*
	 * simple assert function
	 */
	assert(expression, message) {
		if (!expression)
			throw new AssertionError(message);
		if (message)
			log.out(`Tester.assert() got a truthy expression (message: "${message}")`, 'OK');
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
	run(...tests) {
		$.each(tests, (i, test) => {
			if (this.tests.hasOwnProperty(test)) {
				this.tests[test]();
				log.out(`\nTester.run(): test "${test}" passed!\n`);
			} else {
				log.out(`Tester.run(): unable to run test "${test}"`);
				log.out(`Tester.run(): available tests: ${Object.keys(this.tests).join(', ')}`);
			}
		});

		if (tests.length > 1)
			log.out('\nTester.run(): all tests passed!\n');

		clearWarning();
	}

	all() {
		log.out('\nExecuting Tester.all()');

		$.each(this.tests, (testName, test) => {
			test();
			log.out(`\nTester.all(): test "${testName}" passed!\n`);
		});

		log.out('\nTester.all(): all tests passed!\n');
		clearWarning();
	}
}
