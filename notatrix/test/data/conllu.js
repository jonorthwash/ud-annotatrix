module.exports = {
  turkic: `# sent_id = mst-0008
# text = Ercan Tezer, iç pazarda bu yıl seksen bin otomobil ve toplam yuzotuz bin araç satılmasının beklendiğini kaydederek, " onalti yıl geriden gidiyoruz " dedi.
1	Ercan	Ercan	PROPN	Prop	Case=Nom|Number=Sing|Person=3	26	nsubj	_	_
2	Tezer	Tezer	PROPN	Prop	Case=Nom|Number=Sing|Person=3	1	flat	_	SpaceAfter=No
3	,	,	PUNCT	Punc	_	26	punct	_	_
4	iç	iç	ADJ	Adj	_	16	amod	_	_
5	pazarda	pazar	NOUN	Noun	Case=Loc|Number=Sing|Person=3	4	compound	_	_
6	bu	bu	DET	Det	_	7	det	_	_
7	yıl	yıl	NOUN	Noun	Case=Nom|Number=Sing|Person=3	16	obl	_	_
8	seksen	seksen	NUM	ANum	NumType=Card	10	nummod	_	_
9	bin	bin	NUM	ANum	NumType=Card	8	flat	_	_
10	otomobil	otomobil	NOUN	Noun	Case=Nom|Number=Sing|Person=3	16	nsubj	_	_
11	ve	ve	CCONJ	Conj	_	15	cc	_	_
12	toplam	toplam	NOUN	Noun	Case=Nom|Number=Sing|Person=3	13	obl	_	_
13	yuzotuz	yuzotuz	NUM	ANum	NumType=Card	15	nummod	_	_
14	bin	bin	NUM	ANum	NumType=Card	13	flat	_	_
15	araç	araç	NOUN	Noun	Case=Nom|Number=Sing|Person=3	10	conj	_	_
16	satılmasının	sat	VERB	Verb	Aspect=Perf|Case=Gen|Mood=Ind|Number[psor]=Sing|Person[psor]=3|Polarity=Pos|Tense=Pres|VerbForm=Vnoun|Voice=Pass	17	nmod:poss	_	_
17	beklendiğini	bekle	VERB	Verb	Aspect=Perf|Case=Acc|Mood=Ind|Number[psor]=Sing|Person[psor]=3|Polarity=Pos|Tense=Past|VerbForm=Part|Voice=Pass	18	obj	_	_
18	kaydederek	kaydet	VERB	Verb	Aspect=Perf|Mood=Ind|Polarity=Pos|Tense=Pres|VerbForm=Conv	26	nmod	_	SpaceAfter=No
19	,	,	PUNCT	Punc	_	18	punct	_	_
20	"	"	PUNCT	Punc	_	24	punct	_	_
21	onalti	onalti	NUM	ANum	NumType=Card	22	nummod	_	_
22	yıl	yıl	NOUN	Noun	Case=Nom|Number=Sing|Person=3	23	nmod	_	_
23	geriden	geri	ADJ	NAdj	Case=Abl|Number=Sing|Person=3	24	amod	_	_
24	gidiyoruz	git	VERB	Verb	Aspect=Prog|Mood=Ind|Number=Plur|Person=1|Polarity=Pos|Polite=Infm|Tense=Pres	26	obj	_	_
25	"	"	PUNCT	Punc	_	24	punct	_	_
26	dedi	de	VERB	Verb	Aspect=Perf|Mood=Ind|Number=Sing|Person=3|Polarity=Pos|Tense=Past	0	root	_	SpaceAfter=No
27	.	.	PUNCT	Punc	_	26	punct	_	_`,

  labels_1: `# text = "This is a simple sentence."
# labels = label1 another_label a-third-label
1	This	This	_	_	_	_	_	_	_
2	is	is	_	_	_	_	_	_	_
3	a	a	_	_	_	_	_	_	_
4	simple	simple	_	_	_	_	_	_	_
5	sentence	sentence	_	_	_	_	_	_	_
6	.	.	PUNCT	PUNCT	_	_	_	_	_`,

  labels_2: `# labels = one_label second third-label
# labels = row_2 again:here this, that
1	This	This	_	_	_	_	_	_	_`,

  labels_3: `# tags = this-is-a-tag test testing test
1	This	This	_	_	_	_	_	_	_`,

  labels_4: `# labels = new label1 one_label this-is-a-tag
1	Hullo	hello	_	_	_	_	_	_	_`,

  nested_2: `# text = ab cde f h
1-2	ab	_	_	_	_	_	_	_	_
1	a	A	_	_	_	_	_	_	_
2	b	B	_	_	_	_	_	_	_
3-5	cde	_	_	_	_	_	_	_	_
3	c	C	_	_	_	_	_	_	_
4	d	D	_	_	_	_	_	_	_
5	e	E	_	_	_	_	_	_	_
6	f	F	_	_	_	_	_	_	_
6.1	silent_g	G	_	_	_	_	_	_	_
7	h	H	_	_	_	_	_	_	_`,

  t: `# testing :)
1-3	He	_	_	_	_	_	_	_	_
1	boued	boued	n	_	m|sg	4	obj	_	_
2	e	e	vpart	_	obj	4	aux	_	_
3	tebr	debriñ	vblex	_	pri|p3|sg	0	root	_	_
4	doob	doobie	np	_	_	3	_	_	_
5	Mona	Mona	np	_	ant|f|sg	4	nsubj	_	_`,

  empty:
      `1      Sue       Sue       _       _       _       _       _       _       _
2      likes     like       _       _       _       _       _       _       _
3      coffee    coffee       _       _       _       _       _       _       _
4      and       and       _       _       _       _       _       _       _
5      Bill      Bill       _       _       _       _       _       _       _
5.1    likes     like       _       _       _       _       _       _       _
6      tea       tea       _       _       _       _       _       _       _`,

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

  cat_ancora:
      `# url = https://raw.githubusercontent.com/UniversalDependencies/UD_Catalan-AnCora/dev/ca_ancora-ud-test.conllu
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

  with_tabs: `# sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1	Кечаень	Кечай	N	N	Sem/Ant_Mal|Prop|SP|Gen|Indef	2	obj	_	Кечаень
2	сыргозтизь	сыргозтемс	V	V	TV|Ind|Prt1|ScPl3|OcSg3	0	root	_	сыргозтизь
3	налкставтыця	налкставтомс	PRC	Prc	V|TV|PrcPrsL|Sg|Nom|Indef	4	amod	_	налкставтыця
4	карвот	карво	N	N	Sem/Ani|N|Pl|Nom|Indef	2	nsubj	_	карвот
5	.	.	CLB	CLB	CLB	2	punct	_	.`,

  without_tabs: `# sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1 Кечаень Кечай N N Sem/Ant_Mal|Prop|SP|Gen|Indef 2 obj _ Кечаень
2 сыргозтизь сыргозтемс V V TV|Ind|Prt1|ScPl3|OcSg3 0 root _ сыргозтизь
3 налкставтыця налкставтомс PRC Prc V|TV|PrcPrsL|Sg|Nom|Indef 4 amod _ налкставтыця
4 карвот карво N N Sem/Ani|N|Pl|Nom|Indef 2 nsubj _ карвот
5 . . CLB CLB CLB 2 punct _ .`,

  from_cg3_with_semicolumn:
      `1	Siedzieliśmy	siedzieć	vblex	_	impf|past|p1|m|pl	_	_	_	_
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

  katya_aplonova_large_arrows:
      `# sent_id = html/meyer_gorog-contes_bambara_10amadu_tara.dis.html:16
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

  katya_aplonova_long:
      `# sent_id = html/meyer_gorog-contes_bambara_10amadu_tara.dis.html:19
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

  ud_example_tabs:
      `1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|4:nsubj	_
2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Pres	0	root	0:root	_
3	and	and	CONJ	CC	_	4	cc	4:cc	_
4	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Pres	2	conj	2:conj	_
5	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|4:obj	_
6	.	.	PUNCT	.	_	2	punct	2:punct	_`,

  ud_example_spaces:
      `1    They     they    PRON    PRP    Case=Nom|Number=Plur               2    nsubj    2:nsubj|4:nsubj  _
2    buy      buy     VERB    VBP    Number=Plur|Person=3|Tense=Pres    0    root     0:root          _
3    and      and     CONJ    CC     _                                  4    cc       4:cc            _
4    sell     sell    VERB    VBP    Number=Plur|Person=3|Tense=Pres    2    conj     2:conj   _
5    books    book    NOUN    NNS    Number=Plur                        2    obj      2:obj|4:obj     _
6    .        .       PUNCT   .      _                                  2    punct    2:punct         _`,

  ud_example_modified:
      `1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|4:nsubj	_
2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Presroot	0	root	0:root	_
3	and	and	CONJ	CC	_	4	cc	4:cc	_
4	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Presconj	2	_	2	_
5	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|4:obj	_
6	.	.	PUNCT	.	_	2	punct	2:punct	_`,

  ud_annotatrix_issue_397: `# sent_id = Not_eating_larvae:2
# text = Гым нэмыӄэй нрзб это ны нырычваԓыӈыттыӄэнат нэмыӄэй гым нывинрэтигым нырычвантойгым.
# text[phon] = ɣəm neməqej нрзб это nə nərəswaɬəŋəttəqenat neməqej ɣəm nəwinretiɣəm nərəswantojɣəm
# text[rus] = Собирали личинок, я тоже помогала, доставала личинок.
# text[eng] = We were gathering the grubs, I also helped, I was extracting the grubs.
# labels = incomplete
1	Гым	гым	PRON	_	Number=Sing|Person=1|PronType=Pers	6	nsubj	6:nsubj	Gloss=я
2	нэмыӄэй	нэмыӄэй	ADV	_	_	_	_	_	Gloss=тоже
3	нрзб	_	X	_	_	6	discourse	6:discourse	Gloss=
4	это	_	PART	_	_	6	discourse	6:discourse	Gloss=
5	ны	ны	X	_	_	6	reparandum	6:reparandum	Gloss=FST
6	нырычваԓыӈыттыӄэнат	_	VERB	_	_	0	root	0:root	Gloss=ST-личинка-CATCH-ST.3SG-PL
7	нэмыӄэй	нэмыӄэй	ADV	_	_	9	advmod	9:advmod	Gloss=тоже
8	гым	гым	PRON	_	Number=Sing|Person=1|PronType=Pers	9	nsubj	9:nsubj	Gloss=я
9	нывинрэтигым	винрэтык	VERB	_	_	6	parataxis	6:parataxis	Gloss=ST-помогать-NP.1SG
10	нырычвантойгым	_	VERB	_	_	6	parataxis	6:parataxis	Gloss=ST-личинка-вынимать-NP.1SG	
10.1	рычва	рычва	NOUN	_	_	_	_	10:obj	Gloss=личинка
11	.	.	PUNCT	_	_	6	punct	6:punct	_			`,

  notatrix_issue_17: `# sent_id = Money:12
# text = Ну ӄэԓюӄъым ытԓыгэ нэнаманэԓпынрыӄэнатэ амъянра наӄам.
# text[phon] = ну qeɬuqʔəm ətɬəɣe nenamaneɬpənrəqenate amjanra naqam
# text[rus] = Ну конечно, отец дал денег, причём каждому отдельно.
# text[eng] = Well, of course, their father gave them money, and each of them separately.
# labels = complete-dep anno-fran
1	Ну	_	X	_	Foreign=Yes	5	discourse	5:discourse	Gloss=
2-3	ӄэԓюӄъым	_	_	_	_	_	_	_	_
2	ӄэԓюӄ	ӄэԓюӄъым	ADV	_	_	5	advmod	5:advmod	Gloss=конечно-=EMPH
3	ъым	ъм	PART	_	_	2	discourse	2:discourse	_
4	ытԓыгэ	ытԓыгын	NOUN	_	Animacy=Anim|Case=Ins	5	nsubj	5:nsubj	Gloss=отец-INS
5-6	нэнаманэԓпынрыӄэнатэ	_	_	_	_	_	_	_	_
5	нэнаманэԓпынрыӄэнат	_	VERB	_	Incorporated[obj]=Yes	0	root	0:root	Gloss=ST-INV-деньги-давать-ST.3SG-PL-=PTCL
5.1	манэ	манэман	NOUN	_	Incorporated=Yes	_	_	5:obj	Gloss=деньги
6	э	а	PART	_	_	5	discourse	5:discourse	_
7	амъянра	_	ADV	_	_	5	advmod	5:advmod	Gloss=RESTR-отдельно
8	наӄам	наӄам	ADV	_	_	5	advmod	5:advmod	Gloss=однако
9	.	.	PUNCT	_	_	5	punct	5:punct	_`,
};
