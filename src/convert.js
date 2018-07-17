'use strict';

const _ = require('underscore');
const nx = require('notatrix');

const detectFormat = require('./detect');
const alerts = require('./alerts');
const errors = require('./errors');

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

	/**
	 * first parse the sentence into a tree
	 */
  function parse(text) {

    class Token {
      constructor(parent) {
        this.parent = parent;

        this.deprel = null;
        this.before = [];
        this.words  = [];
        this.after  = [];
      }

      eachBefore(callback) {
        for (let i=0; i<this.before.length; i++) {
          callback(this.before[i], i);
        }
      }

      eachAfter(callback) {
        for (let i=0; i<this.after.length; i++) {
          callback(this.after[i], i);
        }
      }

      tokenize(sent) {

        this.eachBefore(before => {
          sent = before.tokenize(sent);
        });

        let token = nx.Token.fromParams(sent, {
          form: this.words.join('-'),
          deprel: this.deprel
        });
        sent.insertTokenAt(Infinity, token);

        this.eachAfter(after => {
          sent = after.tokenize(sent);
        });

        this.analysis = token.analysis;

        return sent;
      }

      dependize(sent, id) {

        this.eachBefore(before => {
          sent = before.dependize(sent, this.analysis.id);
        });

        const head = sent.getById(id);
        if (head)
          this.analysis.addHead(head, this.deprel);

        this.eachAfter(after => {
          sent = after.dependize(sent, this.analysis.id);
        });

        return sent;
      }

      toString() {
        return `[${this.deprel}${
          this.before.length
            ? ` ${this.before.map(token => token.toString()).join(' ')}`
            : ''
        } ${this.words.join(' ')}${
          this.after.length
            ? ` ${this.after.map(token => token.toString()).join(' ')}`
            : ''
        }]`;
      }

      push(token) {
        if (this.words.length) {
          this.after.push(token);
        } else {
          this.before.push(token);
        }
      }

      addWord(word) {
        if (!word)
          return;

        if (this.deprel) {
          this.words.push(word);
        } else {
          this.deprel = word;
        }
      }
    }

    class Sentence {
      constructor() {
        this.parent = null;
        this.root = [];
        this.comments = [];
      }

      encode() {
        let sent = new nx.Sentence();

        sent = this.root.tokenize(sent);
        sent.index();
        sent = this.root.dependize(sent, 0);
        sent.comments = this.comments;

        return sent;
      }

      toString() {
        return `${this.root.toString()}`;
      }

      push(token) {
        this.root = token;
      }
    }

    let sent = new Sentence(),
      parsing = sent,
      parent = null,
      word = '';

    try {
      _.each(text, char => {
        switch (char) {
          case ('['):
            parent = parsing;
            parsing = new Token(parent);
            if (parent && parent.push)
              parent.push(parsing)
            word = '';
            break;

          case (']'):
            if (parsing.addWord)
              parsing.addWord(word);
            parsing = parsing.parent;
            parent = parsing.parent;
            word = '';
            break;

          case (' '):
            if (parsing.addWord)
              parsing.addWord(word);
            word = '';
            break;

          default:
            word += char;
            break;
        }
      });

      return sent;

    } catch (e) {

      if (!(e instanceof errors.ParseError))
        throw e;

      return null;
    }
  }

  const parsed = parse(text);
  const encoded = parsed.encode();

  return encoded.conllu;
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
