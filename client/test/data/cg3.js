'use strict';

module.exports = {
nested: `# sent_id = wikipedia:Poyvi_Paraguái:11
# text = Poyvi peteĩha ñane retãmegua niko ojepuru’ypýkuri 15 jasypo guive 16 jasypoteĩ meve ary 1811-pe.
# text[spa] = Bandera uno nosotros de-de _ él-se-utilizó-_ 15 maio desde 16 junio hasta año 1811-en.
"<Poyvi>"
	"poyvi" n
"<peteĩha>"
	"pete" n incp
		"ĩ" v tv pres
			"ha" subs
	"peteĩha" num
"<ñane>"
	"ñandé" prn pers p1 incl pl
"<retãmegua>"
	"*retãmegua"
"<niko>"
	"*niko"
"<ojepuruʼypýkuri>"
	"*ojepuruʼypýkuri"
"<15>"
	"15" num @amod
"<jasypo>"
	"ja" n incp
		"sy" n incp
			"po" n
	"ja" n incp
		"sy" n incp
			"po" v iv pres
	"ja" n incp
		"sy" n incp
			"po" v tv pres
	"ja" prn p1 pl
		"sy" n incp
			"po" n
	"ja" prn p1 pl
		"sy" n incp
			"po" v iv pres
	"ja" prn p1 pl
		"sy" n incp
			"po" v tv pres
	"jasy" n incp
		"po" n
	"jasy" n incp
		"po" v iv pres
	"jasy" n incp
		"po" v tv pres
	"jasypo" n
"<guive>"
	"guive" post @case
"<16>"
	"16" num @amod
"<jasypoteĩ>"
	"jasypoteĩ" n
"<meve>"
	"peve" post @case
"<ary>"
	"ary" n
"<1811-pe>"
	"1811" num
		"pe" post @case`,

/*nested_2: `"<ab>"
	"A" #1->
		"B" #2->
"<cde>"
	"C" #3->
		"D" #4->
			"E" #5->
"<f>"
	"F" #6->
"<h>"
	"H" #7->`,*/

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
	"kegin" n f pl @obl #9->
"<.>"
	"." sent @punct #10->4`, // note: changed line `"kegin" n f pl @obl #8->4`

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

};
