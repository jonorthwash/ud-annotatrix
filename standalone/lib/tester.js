'use strict';

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

    const cases = [
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

    $.each(cases, (i, _case) => {
        const ret = rangeExclusive(..._case.params),
            message = `expected: [${_case.ret.join(',')}], got: [${ret.join(',')}]`;
        this.assert(this.arraysEqual(ret, _case.ret), message);
    });
  }
  detectFormat() {
    log.out('\nExecuting Tester.detectFormat()');

    $.each(TEST_DATA.parseableTexts, (format, texts) => {
      $.each(texts, (j, text) => {
        const ret = detectFormat(text),
            message = `expected (${text}) to be detected as "${format}", but got "${ret}".`;
        this.assert(ret === format, message);
      });
    });
  }
}

const TEST_DATA = {
  parseableTexts: {
    Unknown: [
      '',
      '\n',
      ' ',
      '\t',
      ' \t\n',
      '   '
    ],
    'plain text': [
      'this is a test',
      'this is a test.',
      'this is a test...',
      'this is a test?',
      '\tthis is a test'
    ],
    Brackets: [
      `[root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]`
    ],
    SD: [

`ROOT And Robert the fourth place .
root(ROOT, Robert)
cc(Robert, And)
orphan(Robert, place)
punct(Robert, .)
amod(place, fourth)
det(place, the)`,

`ROOT I love French fries .
root(ROOT, love)`

    ],
    'CoNLL-U': [

`# sent_id = _
# text = this is a test
1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	test	_	_	_	_	_	_	_	_`,

`1	this	_	_	_	_	_	_	_	_
2	is	_	_	_	_	_	_	_	_
3	a	_	_	_	_	_	_	_	_
4	test	_	_	_	_	_	_	_	_`,

`# sent_id = test-s1
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
31	.	.	PUNCT	PUNCT	PunctType=Peri	13	punct	_	_`

    ],
    CG3: [

`"<Өскеменнің>"
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

`"<Аттан>"
  "аттан" v iv imp p2 sg @root #1->0
"<!>"
  "!" sent @punct #2->1`,

`"<Манағы>"
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

    ]
  }
};
