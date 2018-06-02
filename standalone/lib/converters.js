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

    text = text || a.sentence;
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
            return conllu2PlainText(sd2Conllu__raw(text));
        case ('CoNLL-U'):
            return conllu2PlainText(text);
        case ('CG3'):
            const conllu = cg32Conllu(text);
            if (conllu === null) {
                log.warn(`convert2PlainText(): failed to convert: received ambiguous CG3`);
                cantConvertCG();
                return null;
            } else {
                return conllu2PlainText(conllu);
            }
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

    text = text || a.sentence;
    const format = detectFormat(text);
    clearWarning();

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
            return cleanConllu(sd2Conllu__raw(text));
        case ('CoNLL-U'):
            log.info(`convert2conllu(): received CoNLL-U`);
            return cleanConllu(text);
        case ('CG3'):
            data = cg32Conllu(text);
            if (data === null) {
                log.warn(`convert2PlainText(): failed to convert: received ambiguous CG3`);
                cantConvertCG();
                return null;
            } else {
                return cleanConllu(data);
            }
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

    text = text || a.sentence;
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
            return conllu2CG3(sd2Conllu__raw(text));
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
    let sent = new conllu.Sentence();
    const lines = [`# sent_id = _\n# text = ${text}`].concat(  // creating comment
        text.split(' ').map((token, i) => {
            return `${i+1}\t${token}`; // enumerating tokens
        }) );
    sent.serial = lines.join('\n');

    // TODO: automatical recognition of punctuation's POS ==> done?
    $.each(sent.tokens, (i, token) => {
        if (!token.form)
            return;
        if (token.form.match(/^[!.)(»«:;?¡,"\-><]+$/))
            token.upostag = 'PUNCT';
        if (token.form.match(/^[0-9]+([,.][0-9]+)*$/))
            token.upostag = 'NUM';
        if (token.form.match(/^[$%€£¥Æ§©]+$/))
            token.upostag = 'SYM';
    });

    return sent.serial;
}

/**
 * Takes a string in CG, converts it to CoNLL-U format.
 * @param {String} text Input string(CG format)
 */
function sd2Conllu(text) {
    log.debug(`called sd2Conllu(${text})`);

    if (!text)
        return null;

    CONTENTS = sd2Conllu__raw(text); // external function, see standalone/lib/sd2Conllu.js
    FORMAT = 'CoNLL-U';
    log.debug(`sd2Conllu changed CONTENTS to "${CONTENTS}"`);

    loadDataInIndex();
    showDataIndiv();
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

    let sent = new conllu.Sentence();
    sent.serial = cleanConllu(text); // spaces => tabs
    log.debug(`conllu2PlainText(): serial: ${sent.serial}`);

    return sent.tokens.map((token) => {
        return token.form;
    }).join(' ');
}

/**
 * Takes a string in Brackets, converts it to CoNLL-U.
 * @param {String} text Input string
 * @return {String}     CoNLL-U
 */
function brackets2Conllu(text) {
    log.debug(`called brackets2Conllu(${text})`);

    return null; // until we fix this guy

    // This code is for parsing bracketted notation like:
    // [root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]
    // Thanks to Nick Howell for help with a Python version.

    /* Takes a string in bracket notation, returns a string in conllu. */

    // helper functions
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
    return sent.serial;
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

    // TODO: Check for '<s>' ... '</s>' and if you have matching things treat them
    // as comments with #

    // to abort conversion if there are ambiguous analyses
    if (((CGtext) => {

        // suppose the indent is consistent troughout the sentence
        const lines = CGtext.split(/"<(.*)>"/);
        for (let i = 2, l = lines.length; i < l; i += 2) {
            const indent = lines[i].replace('\n', '').split(/[^\s]/)[0],
                analysis = lines[i].trim();
            if (analysis.includes(indent) && !analysis.includes(indent + indent))
                return true;
        }
        return false;

    })(CGtext)) {
        log.debug(`cg32Conllu(): detected ambiguity`);
        return null;
    }

    // remove extra spaces before newline before processing text
    CGtext = CGtext.replace(/ +\n/, '\n');
    let sent = new conllu.Sentence();


    // get the comments
    sent.comments = ((CGtext) => {

        /* Takes a string in CG, returns 2 arrays with strings. */
        return CGtext.split('\n')
            .filter((line) => { return line[0] === '#' })  // take only strings beginning with "#"
            .map((line) => { return line.replace(/^#+/, ''); }); // string off leading "#"s

    })(CGtext);


    // get the tokens
    sent.tokens = ((CGtext) => {
        const _getAnalyses = (line, analyses) => {
            log.debug(`called cg32Conllu:_getAnalyses(line: ${line}, analyses: ${JSON.stringify(analyses)})`);

            // first replace space (0020) with · for lemmas and forms containing
            // whitespace, so that the parser doesn't get confused.
            const quoted = line.replace(/.*(".*?").*/, '$1'),
                forSubst = quoted.replace(/ /g, '·'),
                gram = line.replace(/".*"/, forSubst)
                    .replace(/[\n\t]+/, '').trim().split(' '); // then split on space and iterate

            $.each(gram, (i, analysis) => {
                if (analysis.match(/"[^<>]*"/)) {
                    analyses.lemma = analysis.replace(/"([^<>]*)"/, '$1');
                } else if (analysis.match(/#[0-9]+->[0-9]+/)) {
                    // in CG sometimes heads are the same as the token id, this breaks visualisation #264
                    analyses.head = analysis.replace(/#([0-9]+)->([0-9]+)/, '$2').trim();
                    if (analyses.id === analyses.head)
                        analyses.head = '';
                } else if (analysis.match(/#[0-9]+->/)) {
                    // pass
                } else if (analysis.match(/@[A-Za-z:]+/)) {
                    analyses.deprel = analysis.replace(/@([A-Za-z:]+)/, '$1');
                } else if (i < 2) {
                    analyses.upostag = analysis; // TODO: what about xpostag?
                } else { // saving other stuff
                    analyses.feats = (analyses.feats ? '' : '|') + analysis;
                }
            });

            return analyses;
        };
        const _getToken = (attrs) => {
            log.debug(`called cg32Conllu:_getToken(${JSON.stringify(attrs)})`);

            /* Takes a dictionary of attributes. Creates a new token, assigns
            values to the attributes given. Returns the new token. */

            let newToken = new conllu.Token();
            $.each(attrs, (attr, val) => {
                newToken[attr] = val;
            });

            return newToken;
        };
        const _getSupertoken = (subtokens, form, tokenId) => {
            log.debug(`called cg32Conllu:_getSupertoken(subtokens: ${JSON.stringify(subtokens)}, form: ${form}, tokenId: ${tokenId})`);

            let sup = new conllu.MultiwordToken();
            sup.form = form;

            $.each(subtokens, (i, token) => {
                const newToken = _getAnalyses(token, { id:tokenId, form:'_' });
                sup.tokens.push(_getToken(newToken));
                tokenId++;
            });

            return sup;
        };

        // i use the presupposition that there are no ambiguous readings,
        // because i've aborted conversion of ambiguous sentences above
        const lines = CGtext.split(/"<(.*)>"/).slice(1);
        let tokens = [], tokenId = 1;
        $.each(lines, (i, line) => {
            if (i % 2 === 1) {
                const form = lines[i - 1];
                line = line.replace(/^\n?;?( +|\t)/, '');
                if (!line.match(/(  |\t)/)) {
                    let token = _getAnalyses(line, { form:form, id:tokenId });
                    tokens.push(_getToken(token));
                    tokenId ++;
                } else {
                    const subtokens = line.trim().split('\n'),
                        supertoken = _getSupertoken(subtokens, form, tokenId);
                    tokens.push(supertoken);
                    tokenId += subtokens.length;
                }
            }
        });

        return tokens;

    })(CGtext);

    log.debug(`cg32Conllu(): serial: ${sent.serial}`);
    return sent.serial;
}

/**
 * Takes a string in CoNLL-U, converts it to CG3.
 * @param {String} conlluText CoNLL-U string
 * @param {String} indent     indentation unit (default:'\t')
 * @return {String}     CG3
 */
function conllu2CG3(conlluText, indent) {
    log.debug(`called conllu2CG3(conllu: ${conlluText}, indent: ${indent})`);
    // CG3 spec. reference: https://visl.sdu.dk/cg3_howto.pdf

    if (!conlluText)
        return null;

    let sent = new conllu.Sentence();
    sent.serial = cleanConllu(conlluText);
    indent = indent || '\t';

    let CGtext = (sent.comments.length ? `#${sent.comments.join('\n#')}` : '');

    $.each(sent.tokens, (i, token) => {
        CGtext += (token.form ? `\n"<${token.form}>"\n` : '');
        if (token.tokens === undefined) {
            CGtext += `${indent}${getCG3Analysis(i, token)}`;
        } else {
            CGtext += token.tokens.map((subtoken, j) => {
                return `${indent.repeat(j+1)}${getCG3Analysis(j, subtoken)}`;
            }).join('\n');
        }
    });

    return CGtext.trim();
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





/*
  OBSOLETE, but probably worth keeping around for a bit (5/23/18)


/**
 * Checks if the input box has > 1 sentence.
 * @param {String} text Input text
 * /
function conlluMultiInput(text) { // TODO: this might break after rewriting architecture. fix later.
    log.debug(`called conlluMultiInput(${text})`);

    if (text.match(/\n\n(#.*\n)?1\t/)) {

        // if text consists of several sentences, process it as imported file
        if (text.match(/\n\n/)) // match doublenewline
            CONTENTS = text;

        if (CONTENTS.trim() !== '') { // NOTE: removed some code that didn't do anything :)
            FORMAT = 'CoNLL-U';
            loadDataInIndex();
        }
    }
}

/**
 * Takes a plain text, converts it to CoNLL-U format.
 * @param {String} text Input text
 * /
function txtCorpus2Conllu(text) {
    log.debug(`called txtCorpus2Conllu(${text})`);

    // const splitted = text.match(/[^ ].+?[.!?](?=( |$|\n))/g) || [text];
    const splitted = text.split('\n\n');
    AVAILABLE_SENTENCES = splitted.length;

    // corpus: convert to CoNLL-U by sentence
    return splitted.map((sentence, i) => {
        return plainText2Conllu(sentence.trim());
    }).join('\n');
}
*/
