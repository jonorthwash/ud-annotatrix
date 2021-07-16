# Notatrix
[![CircleCI](https://circleci.com/gh/keggsmurph21/notatrix/tree/master.svg?style=svg)](https://circleci.com/gh/keggsmurph21/notatrix/tree/master)

Experimental notational system for <a href="https://github.com/jonorthwash/ud-annotatrix">UD Annotatrix</a>, combines CoNLL-U and CG3 markup formats into one backend that combines the functionality of both.

 - <a href="#Install">Installation</a>
 - <a href="#Usage">Basic usage</a>
 - <a href="build/docs.md">**API docs**<a>
 - <a href="#Contributing">Contributing</a>
 - <a href="#Related">Related projects</a>
 
## <a id="Install" href="#Install">Installation</a>

For basic usage, just reference the [main file](build/notatrix.js) from a [CDN](https://www.jsdelivr.com/?docs=gh) in an HTML script tag.

For example:
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/keggsmurph21/notatrix/build/notatrix.js"></script>
<script>

  text = 'this is a test';
  sent = new nx.Sentence(text);
  conllu = sent.to('conllu');
  console.log(conllu.output);

</script>
```

Or, just clone the repository!

```bash
$ cd ~/src
$ git clone https://github.com/keggsmurph21/notatrix notatrix
```

Then, you can test it out directly in the browser by including a path to `notatrix/build/notatrix.js` in a script tag of an HTML document.  All of the `notatrix` methods will be available on a global `nx` object.

For example:
```html
<script type="text/javascript" src="file:///home/keggsmurph21/src/notatrix/build/notatrix.js"></script>
<script>

  text = 'this is a test';
  sent = new nx.Sentence(text);
  conllu = sent.to('conllu');
  console.log(conllu.output);

</script>
```

Alternatively, you can use this package in Node.js.  To install the package and all its dependencies:

```bash
$ cd ~/src/some/existing/project
$ npm install notatrix
$ node # NOTE: this command opens the Node.js REPL
```

Then `notatrix` is available as a module via

```js
> const nx = require('notatrix');
```

## <a id="Usage" href="#Usage">Basic usage</a>

### <a id="initializing" href="#initializing">Initializing</a>

The basic unit of `notatrix` is the [`notatrix.Sentence`](build/docs.md#Sentence).  Instances of this class hold format-agnostic information about sentences, and can be constructed from
- <a href="#from_brackets">Brackets</a>
- <a href="#from_cg3">CG3</a>
- <a href="#from_conllu">CoNLL-U</a>
- <a href="#from_params">an array of `field = value` parameters
- <a href="#from_plain_text">a plain string</a>
- <a href="#from_sd">SDParse</a>


#### <a id="from_brackets">a string in `Brackets` notation</a>
```js
const nx = require('notatrix');
const brackets = '[root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]';
const sent = new nx.Sentence(brackets);
```

#### <a id="from_cg3">a `CG3` string</a>
```js
const nx = require('notatrix');
const cg3 = `# sent_id = mst-0001
# text = Peşreve başlamalı.
"<Peşreve>"
	"peşrev" Noun @obl #1->2
"<başlamalı>"
	"başla" Verb SpaceAfter=No @root #2->0
"<.>"
	"." Punc @punct #3->2`;
const sent = new nx.Sentence(cg3);
```

#### <a id="from_conllu">a `CoNLL-U` string</a>
```js
const nx = require('notatrix');
const conllu = `# sent_id = chapID01:paragID1:sentID1
# text = Кечаень сыргозтизь налкставтыця карвот .
# text[eng] = Kechai was awoken by annoying flies.
1	Кечаень	Кечай	N	N	Sem/Ant_Mal|Prop|SP|Gen|Indef	2	obj	_	Кечаень
2	сыргозтизь	сыргозтемс	V	V	TV|Ind|Prt1|ScPl3|OcSg3	0	root	_	сыргозтизь
3	налкставтыця	налкставтомс	PRC	Prc	V|TV|PrcPrsL|Sg|Nom|Indef	4	amod	_	налкставтыця
4	карвот	карво	N	N	Sem/Ani|N|Pl|Nom|Indef	2	nsubj	_	карвот
5	.	.	CLB	CLB	CLB	2	punct	_	.`;
const sent = new nx.Sentence(conllu);
```

#### <a id="from_params">a set of parameters</a>
```js
const nx = require('notatrix');
const params = [
  { form: 'hello' },
  { form: 'world' }
];
const sent = new nx.Sentence(params);
```

#### <a id="from_plain_text">a plain string</a>
```js
const nx = require('notatrix');
const text = 'this is my test string';
const sent = new nx.Sentence(text);
```

#### <a id="from_sd">an SDParse string<a>
```js
const nx = require('notatrix');
const sd = `He says that you like to swim
ccomp(says, like)
mark(like, that)`;
const sent = new nx.Sentence(sd);
```

### <a id="inspecting" href="#inspecting">Inspecting properties of a [`notatrix.Sentence`](build/docs.md#Sentence)</a>

```js
const nx = require('notatrix');
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
console.log(sent.comments.length); // expected 3
console.log(sent.tokens.length);   // expected 8, only counts top-level tokens
console.log(sent.size);            // expected 10, counts all tokens
```

Some interesting properties here are `notatrix.Sentence.comments`, `notatrix.Sentence.tokens`, and `notatrix.Sentence.size`.  For more information about the syntax of working with `notatrix.Sentence` objects, check out the [API Documentation](build/docs.md).

### <a id="converting" href="#Converting">Converting to other formats</a>

Once we have a `notatrix.Sentence`, we can output it to any supported format.  Since not all formats will support all of the information we might want to encode, we get both an `output` string and a `loss` array that gives all of the fields we were unable to encode.  To output to a specific format, we can call `sent.to(format)`, where format is one of ~~`apertium stream`~~ (coming soon!), `brackets`, `cg3`, `conllu`, `notatrix serial`, `params`, `plain text`, or `sd`.

For example:
```js
const nx = require('notatrix');
const conllu = `# this is my first comment
# here is another comment
1	hello	hello	_	_	_	0	root	_
2	,	,	PUNCT	_	_	1	punct	_	_
3	world	world	_	_	_	1	_	_`;
const sent = new nx.Sentence(conllu);

//const toApertiumStream = sent.to('apertium stream');

const toBrackets = sent.to('brackets');
/* expected:
{
  output: '[root hello [punct ,] [_ world]]',
  loss: [ 'comments', 'lemma', 'upostag' ]
}
*/

const toCG3 = sent.to('cg3');
/* expected:
{
  output: '# this is my first comment\n# here is another comment\n"<hello>"\n\t"hello" @root #1->0\n"<,>"\n\t"," PUNCT @punct #2->1\n"<world>"\n\t"world" #3->1',
  loss: []
}
*/

const toConllu = sent.to('conllu');
/* expected:
{
  output: '# this is my first comment\n# here is another comment\n1\thello\thello\t_\t_\t_\t0\troot\t_\t_\n2\t,\t,\tPUNCT\t_\t_\t1\tpunct\t_\t_\n3\tworld\tworld\t_\t_\t_\t1\t_\t_\t_',
  loss: []
}
*/

const toSerial = sent.to('notatrix serial');
/* expected: 
{
  output: { ... },
  loss: []
}
*/

const toParams = sent.to('params');
/* expected:
{
  output: [
    { form: 'hello', lemma: 'hello', head: '0' },
    { form: ',', lemma: ',', upostag: 'PUNCT', head: '1' },
    { form: 'world', lemma: 'world', head: '1' }
  ],
  loss: [ 'comments' ]
}
*/

const toPlainText = sent.to('plain text');
/* expected:
{
  output: 'hello, world',
  loss: [ 'comments', 'lemma', 'heads', 'upostag' ]
}
*/

const toSD = sent.to('sd');
/* expected:
{
  output: '# this is my first comment\n# here is another comment\nhello, world\nroot(ROOT, hello)\npunct(hello, ,)\n_(hello, world)',
  loss: [ 'lemma', 'upostag' ]
}
*/

```


## <a id="Contributing" href="#Contributing">Contributing</a>

Feel free to submit GitHub issues for any bugs or feature requests!  To get started, clone the repository, install the dependencies, and run tests:
```bash
$ cd ~/src
$ git clone https://github.com/keggsmurph21/notatrix.git notatrix
$ cd notatrix
$ npm install
$ npm test
```

If you plan on submitting a pull request, make sure that all the tests pass and that the project still compiles!

#### Testing
```bash
$ npm test
```

#### Recompiling bundled and minified files (for browser)
```bash
$ npm run build
```

#### Executing in the Node.js REPL
```bash
$ cd ~/src/notatrix
$ node
```
```js
> const nx = require('.');
```

## <a id="Related" href="#Related">Related projects</a>

- [UD Annotatrix](https://github.com/jonorthwash/ud-annotatrix) is a client-side, browser-only, language-independent tool for editing dependency trees
- [Notatrix Utils](https://github.com/keggsmurph21/notatrix-utils) is a collection of utilities for working with the `notatrix` format, including a database, a basic server, a web scraper, and (other stuff coming soon)

