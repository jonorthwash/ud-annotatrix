'use strict';

const _ = require('underscore');
const nx = require('notatrix');

const detectFormat = require('./detect');
const alerts = require('./alerts');

/**
 *  convert2<FORMAT>() functions will try to detect the format of any input and
 *    then convert it into <FORMAT> ... they will all fail (return null) if they
 *    detect an Unknown input format
 *
 *    @param {String} text Arbitrary input text
 *    @return {String||null} in <FORMAT>, where <FORMAT> one of
 *      - plain text
 *      - CoNLL-U
 *      - CG3
 *
 *  these functions mostly rely on converting things into CoNLL-U and then reconverting
 *  if necessary ... these are the 'public' functions for the application (called
 *  when the user clicks on one of the converter tabs)
 */

/**
 * Takes a string representing some format, returns the string in
 * plain text or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in plain text format
 */
function convert2PlainText(text) {
	log.debug(`called convert2PlainText(${text})`);

	text = text;// || a.sentence;
	const format = detectFormat(text);

	log.debug(`convert2PlainText(): got format: ${format}`);
	switch (format) {
		case ('Unknown'):
			log.warn(`convert2PlainText(): failed to convert: Unknown input type`);
			return null;
		case ('plain text'):
			log.info(`convert2PlainText(): received plain text`);
			return text;
		case ('Brackets'):
			return conllu2PlainText(brackets2Conllu(text));
		case ('SD'):
			return conllu2PlainText(sd2Conllu(text));
		case ('CoNLL-U'):
			return conllu2PlainText(text);
		case ('CG3'):
			return conllu2PlainText(cg32Conllu(text));
	}
}

/**
 * Takes a string representing some format, returns the string in
 * CoNLL-U or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in CoNLL-U format
 */
function convert2Conllu(text) {
	log.debug(`called convert2conllu(${text})`);

	text = text;// || a.sentence;
	const format = detectFormat(text);

	log.debug(`convert2conllu(): got format: ${format}, text: ${text}`);
	switch (format) {
		case ('Unknown'):
			log.warn(`convert2conllu(): failed to convert Unknown to plain text`);
			return null;
		case ('plain text'):
			return cleanConllu(plainText2Conllu(text));
		case ('Brackets'):
			return cleanConllu(brackets2Conllu(text));
		case ('SD'):
			return cleanConllu(sd2Conllu(text));
		case ('CoNLL-U'):
			log.info(`convert2conllu(): received CoNLL-U`);
			return cleanConllu(text);
		case ('CG3'):
			return cg32Conllu(text);
	}
}

/**
 * Takes a string representing some format, returns the string in
 * CG3 or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in CG3 format
 */
function convert2CG3(text) {
	log.debug(`called convert2CG3(${text})`);

	text = text;// || a.sentence;
	const format = detectFormat(text);

	log.debug(`convert2CG3(): got format: ${format}`);
	switch (format) {
		case ('Unknown'):
			log.warn(`convert2CG3(): failed to convert Unknown to plain text`);
			return null;
		case ('plain text'):
			return conllu2CG3(plainText2Conllu(text));
		case ('Brackets'):
			return conllu2CG3(brackets2Conllu(text));
		case ('SD'):
			return conllu2CG3(sd2Conllu(text));
		case ('CoNLL-U'):
			return conllu2CG3(text);
		case ('CG3'):
			log.info(`convert2CG3(): received CG3`);
			return text;
	}
}



















/**
 *  Helper functions for the convert2<FORMAT> functions described above ... these
 *  handle the implementation of the conversions between specific formats
 */

/**
 * Takes a plain text sentence, returns a sentence in CoNLL-U format.
 * @param {String} text Input text (sentence)
 * @return {String}     Sentence in CoNLL-U format
 */
function plainText2Conllu(text) {
	log.debug(`called plainText2Conllu(${text})`);
	log.debug(`plainText2Conllu(): detected format: ${detectFormat(text)}`);

	// TODO: if there's punctuation in the middle of a sentence,
	// indices shift when drawing an arc
	// punctuation
	text = text.replace(/([^ ])([.?!;:,])/g, '$1 $2');

	/* get it into this form:
	 *
	 * # sent_id = _
	 * # text = $text
	 * 1    $textLine0
	 * 2    $textLine1 [...]
	 *
	 */
	let sent = new nx.Sentence();
	sent.conllu = text.split(' ').map((token, i) => {
		return `${i+1}\t${token}`; // enumerating tokens
	}).join('\n');

	return sent.conllu;
}

/**
 * Takes a string in CG, converts it to CoNLL-U format.
 * @param {String} text Input string(CG format)
 */
function sd2Conllu(text) {
	log.debug(`called sd2Conllu(${text})`);

	/* Takes a string in CG, returns a string in conllu. */
	const inputLines = text.split('\n');
	let tokenId = 1,
		tokenToId = {}, // convert from a token to an index
		heads = [], // e.g. heads[1] = 3
		deprels = []; // e.g. deprels[1] = nsubj

	// first enumerate the tokens
	_.each(inputLines[0].split(' '), (token, i) => {
		tokenToId[token] = tokenId;
		tokenId += 1;
	});

	// When there are two surface forms that are the same, you have to specify the one you
	// are referring to.
	//
	// e.g.
	// the bear eats the crisps.
	// det(bear, the-1)
	// det(crisps, the-4)
	// nsubj(eats, bear)
	//
	// In fact, these numbers are optional for all, so det(bear-2, the-1) would also be valid

	// now process the dependency relations
	_.each(inputLines, (line, i) => {
		if (line.indexOf(',') > -1) { // not root node
			let deprel = '',
				headToken = '',
				depToken = '',
				reading = 'deprel';  // reading \elem [ 'deprel', 'head', 'dep' ]

			for (let j=0, l=line.length; j<l; j++) {
				const word = line[j];

				switch (reading) {
					case ('deprel'):
						if (word === '(') {
							reading = 'head';
						} else {
							deprel += word;
						}
						break;
					case ('head'):
						if (word === ',') {
							reading = 'dep';
						} else {
							headToken += word;
						}
						break;
					case ('dep'):
						if ( !((line[j-1] === ',' && word === ' ') || word === ')') )
							depToken += word;
						break;
				}
			}

			let depId, headId;
			if (depToken.search(/-[0-9]+/) > 0)
				depId = parseInt(depToken.split('-')[1]);
			if (headToken.search(/-[0-9]+/) > 0)
				headId = parseInt(headToken.split('-')[1]);

			log.debug(`sd2Conllu(): ${depToken} → ${headToken} @${deprel} | ${tokenToId[depToken]} : tokenToId[headToken] // ${depId} → ${headId}`);
			heads[depId] = headId;
			deprels[depId] = deprel;
		}
	});

	tokenId = 0;
	let sent = new nx.Sentence();
	sent.params = inputLines[0].split(' ').map(token => {
		tokenId++;

		return {
			form: token,
			head: heads[tokenId],
			deprel: deprels[tokenId]
		};
	});

	return sent.conllu;
}

/**
 * Takes a string in CoNLL-U, converts it to plain text.
 * @param {String} text Input string
 * @return {String}     Plain text
 */
function conllu2PlainText(text) {
	log.debug(`called conllu2PlainText(${text})`);

	if (!text)
		return null;

	let sent = new nx.Sentence();
	sent.conllu = text;
	return sent.text;
}

/**
 * Takes a string in Brackets, converts it to CoNLL-U.
 * @param {String} text Input string
 * @return {String}     CoNLL-U
 */
function brackets2Conllu(text) {
	return null;

	/*
	log.debug(`called brackets2Conllu(${text})`);

	return null; // until we fix this guy

	// This code is for parsing bracketted notation like:
	// [root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]
	// Thanks to Nick Howell for help with a Python version.

	/* Takes a string in bracket notation, returns a string in conllu. */

	/*// helper functions
	const _node = (s, j) => {
		log.debug(`called brackets2Conllu._node(s: ${s}, j: ${j})`);

		function _Node(name, s, index, children) {
			log.debug(`called brackets2Conllu._node._Node constructor (name: ${name}, s: ${s}, index: ${index}, children: ${children})`);

			this.name = name;
			this.s = s;
			this.index = index;
			this.children = children;

			this.maxindex = () => {
				// Returns the maximum index for the node
				// mx = max([c.index for c in self.children] + [self.index])
				let localmax = 0;
				if (parseInt(this.index) > localmax)
					localmax = parseInt(this.index);

				$.each(this.children, (i, child) => {
					if (parseInt(child.index) > localmax)
						localmax = parseInt(child.index);
				});

				return localmax;
			};

			this.paternity = () => {
				$.each(this.children, (i, child) => {
					child.parent = this;
					child.paternity();
				});

				return this;
			};

			this.parent_index = () => {
				if (this.parent !== undefined) {
					if (this.parent.index !== undefined)
						return this.parent.index;
				}
				return 0;
			};
		}


		const _match = (s, up, down) => {
			log.debug(`called brackets2Conllu._node._match(s: ${s}, up: ${up}, down: ${down})`);

			let depth = 0, i = 0;
			while(i < s.length && depth >= 0) {

				if (s[i] === up)
					depth += 1;

				if (s[i] === down)
					depth -= 1;

				i++;
			}

			return s.slice(0,i-1);
		};

		const _max = (list) => {
			log.debug(`called brackets2Conllu._node._max(${JSON.stringify(list)})`);

			// Return the largest number in a list otherwise return 0
			// @l = the list to search in
			let localmax = 0;
			$.each(list, (i, item) => {
				localmax = Math.max(item, localmax);
			});

			return localmax;
		};

		const _count = (needle, haystack) => {
			log.debug(`called brackets2Conllu._node._count(needle: ${needle}, haystack: ${JSON.stringify(haystack)})`);

			// Return the number of times you see needle in the haystack
			// @needle = string to search for
			// @haystack = string to search in
			let acc = 0;
			for (let i=0, l=haystack.length; i<l; i++) {
				if (needle === haystack[i])
					acc++;
			}
			return acc;
		};


		// Parse a bracketted expression
		// @s = the expression
		// @j = the index we are at

		if (s[0] === '[' && s[-1] === ']')
			s = s.slice(1, -1);

		const first = s.indexOf(' '), // the first space delimiter
			name = s.slice(0, first), // dependency relation name
			remainder = s.slice(first, s.length);

		// this is impossible to understand without meaningful variables names .....
		let i = 0, index = 0, children = [], word;
		while (i < remainder.length) {

			if (remainder[i] === '[') {
				// We're starting a new expression

				const m = _match(remainder.slice(i+1, remainder.length), '[', ']'),
					indices = [index].concat(children.map((child) => { return child.maxindex(); })),
					n = _node(m, _max(indices));

				children.push(n);
				i += m.length + 2;

				if (!word)
					index = _max([index, n.maxindex()]);

			} else if (remainder[i] !== ' ' && (remainder[i-1] === ' ' || i === 0)) {

				const openBracketIndex = remainder.indexOf('[', i);

				if (openBracketIndex < 0) {
					word = remainder.slice(i, remainder.length);
				} else {
					word = remainder.slice(i, remainder.indexOf(' ', i));
				}

				i += word.length;
				index += 1 + _count(' ', word.trim());

			} else {
				i++;
			}
		}

		return new _Node(name, word, index, children);
	};
	const _fillTokens = (node, tokens) => {
		log.debug(`called brackets2Conllu._fillTokens(node: ${node}, tokens: ${JSON.stringify(tokens)})`);

		let newToken = new conllu.Token();
		newToken.form = node.s;

		// TODO: automatic recognition of punctuation's POS
		if (newToken['form'].match(/^[!.)(»«:;?¡,"\-><]+$/))
			newToken.upostag = 'PUNCT';

		newToken.id = node.index;
		newToken.head = node.parent_index();
		newToken.deprel = node.name;
		log.debug(`_fillTokens() newToken: (form: ${newToken.form}, id: ${newToken.id}, head: ${newToken.head}, deprel: ${newToken.deprel})`);

		tokens.push(newToken);
		$.each(node.children, (i, child) => {
			tokens = _fillTokens(child, tokens);
		});

		return tokens;
	};

	const inputLines = text.split('\n'),
		comments = '';

	let tokens = [], // list of tokens
		root = _node(inputLines[0], 0);

	root.paternity();
	tokens = _fillTokens(root, tokens);
	log.debug(`brackets2Conllu(): tokens: ${JSON.stringify(tokens)}`);

	let sent = new conllu.Sentence();
	sent.comments = comments;
	sent.tokens = tokens;
	return sent.serial;*/
}

/**
 * Takes a string in CG3, converts it to CoNLL-U.
 * @param {String} CGtext CG3 string
 * @return {String}     CoNLL-U
 */
function cg32Conllu(CGtext) {
	log.debug(`called cg32Conllu(${CGtext})`);

	if (!CGtext)
		return null;

	/* Takes a string in CG3, returns a string in CoNLL-U. */

	// remove extra spaces before newline before processing text
	let sent = new nx.Sentence({ catchInvalid: false });
	sent.cg3 = CGtext.replace(/ +\n/, '\n');

	try {
		return sent.conllu;
	} catch (e) {

		if (e instanceof nx.Error.InvalidCoNLLUError) {
			alerts.unableToConvertToConllu();
			return null;
		}

		throw e;
	}
}

/**
 * Takes a string in CoNLL-U, converts it to CG3.
 * @param {String} conlluText CoNLL-U string
 * @param {String} indent     indentation unit (default:'\t')
 * @return {String}     CG3
 */
function conllu2CG3(conlluText) {
	log.debug(`called conllu2CG3(${conlluText}`);

	if (!conlluText)
		return null;

	let sent = new nx.Sentence({ catchInvalid: false });
	sent.conllu = conlluText;

	try {
		return sent.cg3;
	} catch (e) {

		if (e instanceof nx.Error.InvalidCG3Error) {
			alerts.unableToConvertToCG3();
			return null;
		}

		throw e;
	}
}

/**
 * return a CG3 analysis for a token
 *  - helper function for conllu2CG3() and onEnter()
 */
function getCG3Analysis(i, token) {
	log.debug(`called conllu2CG3:getCG3Analysis(i: ${i}, token: ${JSON.stringify(token)})`);

	const lemma = (token.lemma ? `"${token.lemma}"` : `""`), // lemma should have "" if blank (#228)
		pos = token.upostag || token.xpostag || '_',
		feats = (token.feats ? ` ${token.feats.replace(/\|/g, ' ')}` : ''),
		deprel = (token.deprel ? ` @${token.deprel}` : ' @x'), // is it really what we want by default?
		head = token.head || '',
		cgToken = `${lemma} ${pos}${feats}${deprel} #${token.id}->${head}`;

	log.debug(`got cgToken: ${cgToken}`);
	return cgToken;

};


/**
 * Cleans up CoNNL-U content.
 * @param {String} content Content of input area
 * @return {String}     Cleaned up content
 */
function cleanConllu(content) {
    log.debug(`called cleanConllu(${content})`);

    if (!content)
        return null;

    // if we don't find any tabs, then convert >1 space to tabs
    // TODO: this should probably go somewhere else, and be more
    // robust, think about vietnamese D:
    let res = content.search('\n');
    if (res < 0)
        return content;

    /*
    // maybe someone is just trying to type conllu directly...
    res = (content.match(/_/g) || []).length;
    if (res <= 2)
        return content; */

    // If we don't find any tabs, then we want to replace multiple spaces with tabs
    const spaceToTab = true;//(content.search('\t') < 0);
    const newContent = content.trim().split('\n').map((line) => {
        line = line.trim();

        // If there are no spaces and the line isn't a comment,
        // then replace more than one space with a tab
        if (line[0] !== '#' && spaceToTab)
            line = line.replace(/[ \t]+/g, '\t');

        return line
    }).join('\n');

    // If there are >1 CoNLL-U format sentences is in the input, treat them as such
    // conlluMultiInput(newContent); // TODO: move this one also inside of this func, and make a separate func for calling them all at the same time

    //if (newContent !== content)
        //$('#text-data').val(newContent);

    return newContent;
}


module.exports = {
	to: {
		plainText: convert2PlainText,
		conllu: convert2Conllu,
		cg3: convert2CG3
	}
};