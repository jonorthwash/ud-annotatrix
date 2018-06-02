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
3 валгсь валгомс VERB V|Ind|Prt1|ScSg3 Mood=Ind|Number[subj]=Sing|Person[subj]=3|Tense=Prt1 51 advcl _ SpaceAfter=No
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
52 . . PUNCT CLB _ 51 punct _ _`,

katya_aplonova_large_arrows: `# sent_id = html/meyer_gorog-contes_bambara_10amadu_tara.dis.html:16
# text = ko ni i sera ka jiri nin bulu sòrò ka na ni a ye, ko cèkòròba bè se ka furakè o la.
1	ko	kó	PART	cop	_	4	discourse	_	Gloss=QUOT
2	ni	ní	SCONJ	conj	_	4	mark	_	Gloss=si
3	i	í	PRON	pers	PronType=Prs	4	nsubj	_	Gloss=2.SG
4	sera	sera	VERB	v	Aspect=Perf|Valency=1|Polarity=Pos	19	advcl	_	Gloss=arriver|Morf=arriver,PFV.INTR
5	ka	kà	AUX	pm	_	9	aux	_	Gloss=INF
6	jiri	jíri	NOUN	n	_	8	nmod:poss	_	Gloss=arbre
7	nin	nìn	DET	prn/dtm	PronType=Dem|Definite-Def	6	det	_	Gloss=DEM
8	bulu	búlu	NOUN	n	_	9	obj	_	Gloss=feuille
9	sòrò	sɔ̀rɔ	VERB	v	_	4	xcomp	_	Gloss=obtenir
10	ka	kà	AUX	pm	_	11	aux	_	Gloss=INF
11	na	nà	VERB	v	_	9	xcomp	_	Gloss=venir
12	ni	ní	ADP	conj/prep	_	13	case	_	Gloss=et
13	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	11	obl	_	Gloss=3SG
14	ye	yé	ADP	pp	_	13	case	_	Gloss=PP
15	,	,	PUNCT	_	_	4	punct	_	Gloss=,
16	ko	kó	PART	cop	_	19	discourse	_	Gloss=QUOT
17	cèkòròba	cɛ̀.kɔrɔ.ba	NOUN	n	_	19	nsubj	_	Gloss=vieillard|Morf=vieillard,mâle,vieux,AUGM
18	bè	bɛ́	AUX	pm	Polarity=Pos|Aspect=Imp	19	aux	_	Gloss=IPFV.AFF
19	se	sé	VERB	v	_	0	root	_	Gloss=arriver
20	ka	kà	AUX	pm	_	21	aux	_	Gloss=INF
21	furakè	fúra.kɛ	VERB	v	_	19	xcomp	_	Gloss=soigner|Morf=soigner,feuille,faire
22	o	ò	PRON	prn	_	21	obl	_	Gloss=ce
23	la	lá	ADP	pp	_	22	case	_	Gloss=dans
24	.	.	PUNCT	_	_	19	punct	_	Gloss=.
`,

katya_aplonova_long: `# sent_id = html/meyer_gorog-contes_bambara_10amadu_tara.dis.html:19
# text = ko u ye mògò nyini a ye, min bè a furakè sisan ko cè ye furakèli cogoya bèè fò, ko fura nin sòrò ka gèlèn ko epi ko ni o ye a sòrò u ye ale den de ye, ni min bè sa de furanyini fè a ka sa nin min bè balo o ka balo ko u kònòntò bèè ka taga fura nin nyini, ko u kònòntò bèè ka taga ko nin min seginna ka a sòrò fura ma na, ko a bè o den nin haramuya ka o gèn, ka a bè a ba fana gèn ko u ka a filè u yèrè ni min ma sòn fana ko a bè o gèn, o ni a ba bèè.
# label = too_long_to_cut
1	ko	kó	PART	cop	_	5	discourse	_	Gloss=QUOT
2	u	ù	PRON	pers	PronType=Prs|Number=Plur|Person=3	5	nsubj	_	Gloss=3PL
3	ye	yé	AUX	pm	Aspect=Perf|Valency=2|Polarity=Pos	5	aux	_	Gloss=PFV.TR
4	mògò	mɔ̀gɔ	NOUN	n	_	5	obj	_	Gloss=homme
5	nyini	ɲíni	VERB	v	_	0	root	_	Gloss=chercher
6	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	5	obl	_	Gloss=3SG
7	ye	yé	ADP	pp	_	6	case	_	Gloss=PP
8	,	,	PUNCT	_	_	5	punct	_	Gloss=,
9	min	mín	PRON	prn	PronType=Rel	_	_	_	Gloss=REL
10	bè	bɛ́	AUX	pm	Polarity=Pos|Aspect=Imp	_	_	_	Gloss=IPFV.AFF
11	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
12	furakè	fúra.kɛ	VERB	v	_	_	_	_	Gloss=soigner|Morf=soigner,feuille,faire
13	sisan	sísan	ADV	adv/n	_	_	_	_	Gloss=maintenant
14	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
15	cè	cɛ̀	NOUN	n	_	_	_	_	Gloss=mâle
16	ye	ye	AUX	pm	Aspect=Perf|Valency=2|Polarity=Pos	_	_	_	Gloss=PFV.TR
17	furakèli	fúrakɛli	NOUN	n	VerbalForm=Vnoun	_	_	_	Gloss=traitement|Morf=traitement,feuille,faire,NMLZ
18	cogoya	cógoya	NOUN	n	_	_	_	_	Gloss=manière|Morf=manière,manière,ABSTR
19	bèè	bɛ́ɛ	DET	dtm	_	_	_	_	Gloss=tout
20	fò	fɔ́	VERB	v	_	_	_	_	Gloss=dire
21	,	,	PUNCT	_	_	_	_	_	Gloss=,
22	ko	kó	PART	cop	_	27	discourse	_	Gloss=QUOT
23	fura	fúra	NOUN	n	_	25	nmod:poss	_	Gloss=feuille
24	nin	nìn	DET	dtm	PronType=Dem|Definite-Def	23	det	_	Gloss=DEM
25	sòrò	sɔ̀rɔ	NOUN	v	_	27	nsubj	_	Gloss=obtenir
26	ka	ka	AUX	pm	Polarity=Pos	27	aux	_	Gloss=QUAL.AFF
27	gèlèn	gɛ̀lɛn	VERB	vq	_	_	_	_	Gloss=dur
28	ko	kó	PART	cop	_	29	discourse	_	Gloss=QUOT
29	epi	epi	CCONJ	conj	_	27	cc	_	Gloss=ETRG.FRA
30	ko	kó	VERB	cop	_	37	discourse	_	Gloss=QUOT
31	ni	ní	SCONJ	conj	_	35	mark	_	Gloss=si
32	o	ò	PRON	prn	_	35	nsubj	_	Gloss=ce
33	ye	ye	AUX	pm	Aspect=Perf|Valency=2|Polarity=Pos	35	aux	_	Gloss=PFV.TR
34	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	35	obj	_	Gloss=3SG
35	sòrò	sɔ̀rɔ	VERB	v	_	37	advcl	_	Gloss=obtenir
36	u	ù	PRON	pers	PronType=Prs|Number=Plur|Person=3	37	nsubj	_	Gloss=3PL
37	ye	yé	VERB	cop	Polarity=Pos	27	parataxis	_	Gloss=EQU
38	ale	àlê	PRON	pers	PronType=Prs|Number=Sing|Person=3|PronType=Emp	39	nmod:poss	_	Gloss=3SG.EMPH
39	den	dén	NOUN	n	_	37	obl	_	Gloss=enfant
40	de	dè	PART	prt	_	39	discourse	_	Gloss=FOC
41	ye	yé	ADP	pp	_	39	case	_	Gloss=PP
42	,	,	PUNCT	_	_	37	punct	_	Gloss=,
43	ni	ní	SCONJ	conj	_	46	mark	_	Gloss=si
44	min	mîn	PRON	prn	PronType=Rel	46	_	_	Gloss=REL
45	bè	bɛ	AUX	pm	Polarity=Pos|Aspect=Imp	46	_	_	Gloss=IPFV.AFF
46	sa	sà	VERB	v	_	52	_	_	Gloss=mourir
47	de	dè	PART	prt	_	46	_	_	Gloss=FOC
48	furanyini	furaɲini	NOUN	n	_	46	_	_	Gloss=feuille|Morf=feuille,chercher
49	fè	fɛ̀	ADP	pp	_	48	_	_	Gloss=par
50	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	52	_	_	Gloss=3SG
51	ka	ka	AUX	pm	Mood=Subj|Polarity=Aff	52	_	_	Gloss=SBJV
52	sa	sà	VERB	v	_	37	_	_	Gloss=mourir
53	nin	ní	SCONJ	conj	_	56	mark	_	Gloss=quand
54	min	mîn	PRON	prn	PronType=Rel	56	_	_	Gloss=REL
55	bè	bɛ	AUX	pm	Polarity=Pos|Aspect=Imp	56	_	_	Gloss=IPFV.AFF
56	balo	bálo	VERB	v	_	59	_	_	Gloss=vivre
57	o	ò	PRON	prn	_	59	_	_	Gloss=ce
58	ka	ka	AUX	pm	Mood=Subj|Polarity=Aff	59	_	_	Gloss=SBJV
59	balo	bálo	VERB	v	_	52	_	_	Gloss=vivre
60	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
61	u	ù	PRON	pers	PronType=Prs|Number=Plur|Person=3	_	_	_	Gloss=3PL
62	kònòntò	kɔ̀nɔntɔn	NUM	num	_	_	_	_	Gloss=neuf
63	bèè	bɛ́ɛ	DET	dtm	_	_	_	_	Gloss=tout
64	ka	ka	AUX	pm	Mood=Subj|Polarity=Aff	_	_	_	Gloss=SBJV
65	taga	tága	VERB	v	_	59	_	_	Gloss=aller
66	fura	fúra	NOUN	n	_	_	_	_	Gloss=feuille
67	nin	nìn	DET	dtm	PronType=Dem|Definite-Def	_	_	_	Gloss=DEM
68	nyini	ɲíni	VERB	v	_	_	_	_	Gloss=chercher
69	,	,	PUNCT	_	_	_	_	_	Gloss=,
70	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
71	u	ù	PRON	pers	PronType=Prs|Number=Plur|Person=3	_	_	_	Gloss=3PL
72	kònòntò	kɔ̀nɔntɔn	NUM	num	_	_	_	_	Gloss=neuf
73	bèè	bɛ́ɛ	DET	dtm	_	_	_	_	Gloss=tout
74	ka	ka	AUX	pm	Mood=Subj|Polarity=Aff	_	_	_	Gloss=SBJV
75	taga	tága	VERB	v	_	65	_	_	Gloss=aller
76	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
77	nin	ní	SCONJ	conj	_	_	_	_	Gloss=quand
78	min	mîn	PRON	prn	PronType=Rel	_	_	_	Gloss=REL
79	seginna	seginna	VERB	v	Aspect=Perf|Valency=1|Polarity=Pos	85	_	_	Gloss=revenir|Morf=revenir,PFV.INTR
80	ka	kà	AUX	pm	_	_	_	_	Gloss=INF
81	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
82	sòrò	sɔ̀rɔ	VERB	v	_	_	_	_	Gloss=obtenir
83	fura	fúra	NOUN	n	_	_	_	_	Gloss=feuille
84	ma	ma	AUX	pm	Polarity=Neg|Aspect=Perf	_	_	_	Gloss=PFV.NEG
85	na	nà	VERB	v	_	75	_	_	Gloss=venir
86	,	,	PUNCT	_	_	_	_	_	Gloss=,
87	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
88	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
89	bè	bɛ	AUX	pm	Polarity=Pos|Aspect=Imp	_	_	_	Gloss=IPFV.AFF
90	o	ò	PRON	prn	_	_	_	_	Gloss=ce
91	den	dén	NOUN	n	_	_	_	_	Gloss=enfant
92	nin	nìn	DET	dtm	PronType=Dem|Definite-Def	_	_	_	Gloss=DEM
93	haramuya	hàramuya	VERB	v	_	85	_	_	Gloss=interdire|Morf=interdire,interdire,ABSTR
94	ka	kà	AUX	pm	_	_	_	_	Gloss=INF
95	o	ò	PRON	prn	_	_	_	_	Gloss=ce
96	gèn	gɛ́n	VERB	v	_	_	_	_	Gloss=chasser
97	,	,	PUNCT	_	_	_	_	_	Gloss=,
98	ka	kà	AUX	pm	_	_	_	_	Gloss=INF
99	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
100	bè	bɛ	AUX	pm	Polarity=Pos|Aspect=Imp	_	_	_	Gloss=IPFV.AFF
101	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
102	ba	bá	NOUN	n	_	_	_	_	Gloss=mère
103	fana	fána	PART	prt	_	_	_	_	Gloss=aussi
104	gèn	gɛ́n	VERB	v	_	_	_	_	Gloss=chasser
105	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
106	u	ù	PRON	pers	PronType=Prs|Number=Plur|Person=3	_	_	_	Gloss=3PL
107	ka	ka	AUX	pm	Mood=Subj|Polarity=Aff	_	_	_	Gloss=SBJV
108	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
109	filè	fílɛ	VERB	v	_	_	_	_	Gloss=regarder
110	u	ù	PRON	pers	PronType=Prs|Number=Plur|Person=3	_	_	_	Gloss=3PL
111	yèrè	yɛ̀rɛ̂	DET	dtm	_	_	_	_	Gloss=même
112	ni	ní	SCONJ	conj	_	_	_	_	Gloss=si
113	min	mîn	PRON	prn	PronType=Rel	_	_	_	Gloss=REL
114	ma	ma	AUX	pm	Polarity=Neg|Aspect=Perf	_	_	_	Gloss=PFV.NEG
115	sòn	sɔ̀n	VERB	v	_	_	_	_	Gloss=accepter
116	fana	fána	PART	prt	_	_	_	_	Gloss=aussi
117	ko	kó	PART	cop	_	_	_	_	Gloss=QUOT
118	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
119	bè	bɛ	AUX	pm	Polarity=Pos|Aspect=Imp	_	_	_	Gloss=IPFV.AFF
120	o	ò	PRON	prn	_	_	_	_	Gloss=ce
121	gèn	gɛ́n	VERB	v	_	_	_	_	Gloss=chasser
122	,	,	PUNCT	_	_	_	_	_	Gloss=,
123	o	ò	PRON	prn	_	_	_	_	Gloss=ce
124	ni	ni	CCONJ	conj	_	_	_	_	Gloss=et
125	a	à	PRON	pers	PronType=Prs|Number=Sing|Person=3	_	_	_	Gloss=3SG
126	ba	bá	NOUN	n	_	_	_	_	Gloss=mère
127	bèè	bɛ́ɛ	DET	dtm	_	_	_	_	Gloss=tout
128	.	.	PUNCT	_	_	_	_	_	Gloss=.`,

ud_example_tabs: `1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|4:nsubj
2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Pres	0	root	0:root
3	and	and	CONJ	CC	_	4	cc	4:cc
4	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Pres	2	conj	0:root|2:conj
5	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|4:obj
6	.	.	PUNCT	.	_	2	punct	2:punct`,

ud_example_spaces: `1    They     they    PRON    PRP    Case=Nom|Number=Plur               2    nsubj    2:nsubj|4:nsubj
2    buy      buy     VERB    VBP    Number=Plur|Person=3|Tense=Pres    0    root     0:root
3    and      and     CONJ    CC     _                                  4    cc       4:cc
4    sell     sell    VERB    VBP    Number=Plur|Person=3|Tense=Pres    2    conj     0:root|2:conj
5    books    book    NOUN    NNS    Number=Plur                        2    obj      2:obj|4:obj
6    .        .       PUNCT   .      _                                  2    punct    2:punct`,

ud_example_modified: `1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|4:nsubj
2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Pres	0	root	0:root
3	and	and	CONJ	CC	_	4	cc	4:cc
4	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Pres	2	conj	0:root|2:conj
5	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|4:obj
6	.	.	PUNCT	.	_	2	punct	2:punct`,

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

				((expected) => {
					const actual = a.index;
					this.assert(expected === actual, `current: expected index at ${expected}, got ${actual}`);
				})(current);

				((expected) => {
					const actual = a.length;
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
				a.reset();
				a.parse(str);
				return a.split(str);
			},
			matchAndTrim: (str) => {
				const matched = str.match(/[^.!?]+[.!?]*/g);
				return matched === null
					? [ str ]
					: matched.map((chunk) => {
						return chunk;//.trim();
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
					&& (a.format === 'CoNLL-U' || a.format === 'CG3')))
					this.utils.insertChar(selector, char);

				if (selector === '#text-data') {
					onEditTextData({ which: which });
				} else if (selector.startsWith('#table-data')) {
					onEditTable({ which: which });
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
			},
			compareStrings: (str1, str2) => {
				for (let i=0; i<Math.max(str1.length, str2.length); i++) {
					if (str1[i] !== str2[i]) {
						log.out(`Tester.compareStrings() found discrepancy at index [${i}]`);
						log.out(`string1: [${str1[i]}], string2:[${str2[i]}]`);
						log.out(`\nstring1 context: "${str1.slice(i-10,i+3)}"`);
						log.out(`string2 context: "${str2.slice(i-10,i+3)}"`);
						log.out(`\nstring1: "${str1}"`);
						log.out(`string2: "${str2}"`);
						return false;
					}
				}
				return true;
			},
			randomToken: (conllu) => {
				conllu = conllu || a.conllu;

				const stopAt = this.utils.randomInt(conllu.total);
				let choice = null;
				conllu.iterTokens((num, token) => {
					if (num == stopAt)
						choice = token;
				});

				return choice;
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
								//this.assert(convertedText === null, `expected (${format}:${textName}) to fail to convert.`);
								//failures.push(`${format}:${textName}=>${converterFormat} (expected)`);
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
				a.reset();
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
				this.utils.checkCounts(0, 2);

				a.reset();

			},

			textDataParser: () => {

				log.out(`\nExecuting Tester.textDataParser(): Phase 1: basic text splitting`);
				$.each([
					{ str:'this is the first test', split:['this is the first test'] },
					{ str:'this is, the second', split:['this is, the second'] },
					{ str:'one sentence.', split:['one sentence.'] },
					{ str:'one! two!', split:['one!', ' two!'] },
					{ str:'one. two! three?', split:['one.', ' two!', ' three?'] },
				], (i, datum) => {

					const splitted = this.utils.splitAndSet(datum.str),
						message = `expected [${datum.split}]; got [${splitted}]`;

					this.assert(this.arraysEqual(datum.split, splitted), message);
					this.utils.checkCounts(splitted.length - 1, splitted.length);

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

							this.utils.checkCounts(actual.length - 1, actual.length);

						});
					});
				});

				a.reset();

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
						$.each(a.lines, (k, line) => {
							EOLs.push(acc + line.length + k);
							acc += line.length;
						});

						$.each(EOLs.reverse(), (l, eol) => {
							this.utils.simKeyup('#text-data', '\n', eol);
						});
					});
				});

				log.out(`\nExecuting Tester.onEnter(): Phase 2: randomized enter testing`);

				for (let i=0; i<10; i++) { // repeat tests 10 times
					$.each(this.utils.randomize(), (j, randomized) => { // sample once per format
						const format = randomized.format,
								text = randomized.text.join('');

						if (format === 'Unknown')
							return;

						this.utils.splitAndSet(text);
						for (let k=0; k < 5; k++) { // trying hitting <Enter> multiple times

							const cursor = this.utils.randomInt(a.length);
							this.utils.simKeyup('#text-data', '\n', cursor);
							a.parse();
							this.utils.jumpToSentence(1);

							this.assert(format === a.format,
								`expected format to be ${format}, got ${a.format}`);
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
							text = randomized.text.join('');

						this.utils.splitAndSet(text);
						toggleTable(null, true);

						if (format !== 'CoNLL-U') {
							this.assert(a.is_table_view === false, `expected ${format} not to have table view`);
						} else {
							this.assert(a.is_table_view === true, `expected CoNLL-U to have table view available`);

							// try editing
							const testString = 'test';
							$('td').not('[name=index]').find('[name=input]').text(testString);
							$('td').first().blur();

							$.each(a.lines, (k, line) => {
								const tabs = line.split('\t');
								if (tabs.length !== 10 || tabs[0].startsWith('#'))
									return;
								$.each(tabs, (l, tab) => {
									if (l > 0)
										this.assert(tab === testString, `expected text to be "${testString}", got "${tab}" (line: "${line}")`);
								})
							})
						}

					});
				}
				this.utils.splitAndSet(TEST_DATA.texts_by_format['CoNLL-U'].from_cg3_with_spans);
				toggleTable(null, true);
			},

			clearCorpus: () => {
				log.out(`\nExecuting Tester.clearCorpus()`);

				for (let i=0; i<10; i++) {
					$.each(this.utils.randomize(), (j, randomized) => {

						this.utils.splitAndSet(randomized.text.join(''));
						clearCorpus(null, true);
						this.utils.checkCounts(0, 1);

					});
				}
			},

			modifyConllu: () => {
				log.out(`\nExecuting Tester.modifyConllu()`);

				const modifiableKeys = ['deprel', 'deps', 'feats', 'form', 'head', 'lemma', 'upostag', 'xpostag'];
				const newAttrValue = 'TEST!';

				// make sure the problematic one passes first
				test.utils.splitAndSet(TEST_DATA.texts_by_format['CoNLL-U'].from_cg3_with_spans);
				a.iterTokens((num, token, i, superToken, j, subToken) => {
					let oldConllu = a.conllu.serial;
					const randomAttr = this.utils.sample(modifiableKeys)[0];
					const oldAttrValue = modifyConllu(i, j, randomAttr, newAttrValue);
					modifyConllu(i, j, randomAttr, oldAttrValue);

					const invertible = this.utils.compareStrings(oldConllu, a.conllu.serial);
					this.assert(invertible, `expected an invertible transformation for token[${i}] "${token.form}" on attr [${randomAttr}] "${oldAttrValue}"=>"${newAttrValue}"`);
				});

				// then randomize
				$.each(this.utils.sample(TEST_DATA.texts_by_format['CoNLL-U'], 25), (i, text) => {
					this.utils.splitAndSet(text);

					const oldConllu = a.conllu.serial;
					const randomToken = this.utils.randomInt(a.tokens.length);
					const randomAttr  = this.utils.sample(modifiableKeys);

					const oldAttrValue = modifyConllu(randomToken, null, randomAttr, newAttrValue);

					const newConllu = a.conllu;
					this.assert(newConllu.tokens[randomToken][randomAttr] === newAttrValue, `expected to modify attr [${randomAttr}] "${oldAttrValue}"=>"${newAttrValue}"`);

					modifyConllu(randomToken, null, randomAttr, oldAttrValue);

					const invertible = this.utils.compareStrings(oldConllu, a.conllu.serial);
					this.assert(invertible, `expected an invertible transformation on attr [${randomAttr}]`);

				});
				//modifyConllu(1, null, 'upostag', 'TEST');
			},

			conlluCustomSerializer: () => {
				log.out(`\nExecuting Tester.conlluCustomSerializer()`);

				$.each(TEST_DATA.texts_by_format['CoNLL-U'], (identifier, text) => {
					this.utils.splitAndSet(text);

					const clean = (str) => {
						return str.trim().split('\n').map(line => { // clean whitespace on ends
							line = line.replace(/^\#[ \t]*/, '#'); // clean whitespace after comments
							if (line.startsWith('#')) // comment
								return line;

							// allow for fixed form/lemma stuff
							const tabs = line.split('\t');
							tabs[1] = '<OMIT>';
							tabs[2] = '<OMIT>';

							return tabs.join('\t');
						}).join('\n');
					};

					this.assert(this.utils.compareStrings(
						clean(a.conllu.serial), // the computed one
						clean(a.conllu.sentence.serial) // the module-provided one
					), `expected serials to be identical after reinterpretation`);
				});
			},

			conlluInsert: () => {
				log.out(`\nExecuting Tester.conlluInsert()`);

				$.each(TEST_DATA.texts_by_format['CoNLL-U'], (identifier, text) => {
					this.utils.splitAndSet(text);

					// setup
					const serial = a.conllu.serial;
					const orig = Object.assign(a.tokens);

					for (let i=a.conllu.length - 1; i >= 0; i--) { // go backwards
						const token = a.tokens[i];
						if (token.tokens) {
							for (let j=token.tokens.length - 1; j >= 0; j--) {
								a.conllu.insert(i, j, { misc:'subtoken' });
							}
							a.conllu.insert(i, Infinity, { misc:'final-subtoken' });
						}
						a.conllu.insert(i, null, { misc:'token' });
					}
					a.conllu.insert(Infinity, null, { misc:'final-token' });

					// internal consistency, doesn't really show anything
					this.assert(a.conllu.total + a.conllu.comments.length === a.conllu.serial.split('\n').length);

					// actual tests
					for (let i=0; i<a.conllu.length; i++) {
						const token = a.tokens[i];
						const origToken = orig[Math.floor(i/2)];
						if (i%2) {
							this.assert(Token.equals(token, origToken), `expect these subtokens to be identical (real: ${token.id}, orig: ${origToken.id})`);
						} else if (i<a.conllu.length - 1) {
							this.assert(token.misc === 'token', `expect this subtoken to have "token" in misc`);
						} else {
							this.assert(token.misc === 'final-token', `expect this subtoken to have "final-token" in misc`);
						}
						if (token.tokens) {
							for (let j=0; j<token.tokens.length; j++) {
								const subToken = token.tokens[j];
								const origST = origToken.tokens[Math.floor(j/2)];
								if (j%2) {
									this.assert(Token.equals(subToken, origST), `expect these subtokens to be identical (real: ${subToken.id}, orig: ${origST.id})`);
								} else if (j<token.tokens.length - 1) {
									this.assert(subToken.misc === 'subtoken', `expect this subtoken to have "subtoken" in misc`);
								} else {
									this.assert(subToken.misc === 'final-subtoken', `expect this subtoken to have "final-subtoken" in misc`);
								}
							}
						}
					}

				});
			},

			conlluRemove: () => {
				log.out(`\nExecuting Tester.conlluRemove()`);

				$.each(TEST_DATA.texts_by_format['CoNLL-U'], (identifier, text) => {

					this.utils.splitAndSet(text);
					while (a.conllu.remove(Infinity, null)) { }
					this.assert(a.conllu.total === 0, `expected to remove all elements`);

					this.utils.splitAndSet(text);
					const serial = a.conllu.serial;

					for (let i=0; i<10; i++) { // repeat 10x
						const sup = this.utils.randomInt(a.conllu.length);
						const sub = a.tokens[sup].tokens
							? this.utils.randomInt(a.tokens[sup].tokens.length) : null;

						// NOTE: this won't necessarily work in the other order because
						//   of "swallow merges"
						a.conllu.insert(sup, sub);
						a.conllu.remove(sup, sub);

						this.assert(this.utils.compareStrings(serial, a.conllu.serial), `expected to be able to insert and remove invertibly`);
					}
				});
			},

			conlluMerge: () => {
				const strategies = {
					swallow: { min:  1, max:  1 },
					inner:   { min:  1, max:  2 },
					combine: { min: -1, max: -1 },
					squish:  { min:  1, max:  1 }
				};

				log.out(`\nExecuting Tester.conlluMerge()`);
				$.each(TEST_DATA.texts_by_format['CoNLL-U'], (identifier, text) => {
					this.utils.splitAndSet(text);

					for (let i=0; i<10; i++) { // repeat 10x
						$.each(strategies, (strategy, data) => {
							const tok1 = this.utils.randomToken(),
										tok2 = this.utils.randomToken(),
										toks = a.conllu.total;

							if (a.conllu.merge(tok1, tok2, strategy)) {

								const diff = toks - a.conllu.total;
								this.assert(data.min <= diff && diff <= data.max, `expected a change between ${data.min} and ${data.max}, got ${diff} (strategy:${strategy})`);

								// insert a new random token just to keep it interesting
								let sup = this.utils.randomInt(a.conllu.length),
										sub = this.utils.randomInt(-1, 5);
								sub = sub < 0 ? null : sub;
								a.conllu.insert(sup, sub, { misc:'inserted' });
							}

						});
					}
				});

			},

			conlluSplit: () => {
				log.out(`\nExecuting Tester.conlluSplit()`);

			},


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
		a.graph_disabled = true;
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
		a.graph_disabled = false;
	}

	all() {
		log.out('\nExecuting Tester.all()');
		a.graph_disabled = true;

		$.each(this.tests, (testName, test) => {
			test();
			log.out(`\nTester.all(): test "${testName}" passed!\n`);
		});

		log.out('\nTester.all(): all tests passed!\n');
		clearWarning();
		a.graph_disabled = false;
	}
}
