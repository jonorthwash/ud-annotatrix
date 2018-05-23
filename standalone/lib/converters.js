/**
 * Takes a string representing some format, returns the string in
 * plain text or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in plain text format
 */
function convert2PlainText(text) {
    log.debug(`called convert2PlainText(${text})`);

    const format = detectFormat(text);

    log.debug(`convert2PlainText(): got format: ${format}`);
    switch (format) {
        case ('Unknown'):
            log.warn(`convert2PlainText(): failed to convert: Unknown input type`);
            return null;
        case ('plain text'):
            log.warn(`convert2PlainText(): received plain text`);
            return text;
        case ('Brackets'):
            return conllu2PlainText(brackets2Conllu(text));
        case ('SD'):
            return conllu2PlainText(sd2Conllu2(text));
        case ('CoNLL-U'):
            return conllu2PlainText(text);
        case ('CG3'):
            const conllu = cg32Conllu(text);
            if (conllu === null) {
                log.warn(`convert2PlainText(): failed to convert: received ambiguous CG3`);
                return null;
            } else {
                return conllu2PlainText(conllu);
            }
    }

    log.warn(`convert2PlainText(): unrecognized format: ${format}`);
    return null;
}

/**
 * Takes a string representing some format, returns the string in
 * CoNLL-U or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in CoNLL-U format
 */
function convert2Conllu(text) {
    log.debug(`called convert2conllu(${text})`);

    const format = detectFormat(text);

    log.debug(`convert2conllu(): got format: ${format}`);
    switch (format) {
        case ('Unknown'):
            log.warn(`convert2conllu(): failed to convert Unknown to plain text`);
            return null;
        case ('plain text'):
            return plainText2Conllu(text);
        case ('Brackets'):
            return brackets2Conllu(text);
        case ('SD'):
            return sd2Conllu2(text);
        case ('CoNLL-U'):
            log.warn(`convert2conllu(): received CoNLL-U`);
            return text;
        case ('CG3'):
            return cg32Conllu(text);
    }

    log.warn(`convert2conllu(): unrecognized format: ${format}`);
    return null;
}

/**
 * Takes a string representing some format, returns the string in
 * CG3 or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in CG3 format
 */
function convert2cg3(text) {
    log.debug(`called convert2cg3(${text})`);

    const format = detectFormat(text);

    log.debug(`convert2cg3(): got format: ${format}`);
    switch (format) {
        case ('Unknown'):
            log.warn(`convert2cg3(): failed to convert Unknown to plain text`);
            return null;
        case ('plain text'):
            return conllu2cg3(plainText2Conllu(text));
        case ('Brackets'):
            return conllu2cg3(brackets2Conllu(text));
        case ('SD'):
            return conllu2cg3(sd2Conllu2(text));
        case ('CoNLL-U'):
            return conllu2cg3(text);
        case ('CG3'):
            log.warn(`convert2cg3(): received CG3`);
            return text;
    }

    log.warn(`convert2cg3(): unrecognized format: ${format}`);
    return null;
}


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

    CONTENTS = sd2Conllu2(text); // external function, see standalone/lib/sd2Conllu.js
    FORMAT = 'CoNLL-U';
    log.debug(`sd2Conllu changed CONTENTS to "${CONTENTS}"`);

    loadDataInIndex();
    showDataIndiv();
}

/**
 * Takes a plain text, converts it to CoNLL-U format.
 * @param {String} text Input text
 */
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

/**
 * Checks if the input box has > 1 sentence.
 * @param {String} text Input text
 */
function conlluMultiInput(text) { // TODO: this might break after rewriting architecture. fix later.
    log.debug(`called conlluMultiInput(${text})`);

    if (text.match(/\n\n(#.*\n)?1\t/)) {

        // if text consists of several sentences, process it as imported file
        if (text.match(/\n\n/)) // match doublenewline
            CONTENTS = text;

        if (CONTENTS.trim() !== '') { // NOTE: btnRemoveSentenced some code that didn't do anything :)
            FORMAT = 'CoNLL-U';
            loadDataInIndex();
        }
    }
}


/**
 * Takes a string in CoNLL-U, converts it to plain text.
 * @param {String} text Input string
 * @return {String}     Plain text
 */
function conllu2PlainText(text) {
    log.debug(`called conllu2PlainText(${text})`);

    let sent = new conllu.Sentence();
    sent.serial = cleanConllu(text); // spaces => tabs
    log.debug(`conllu2PlainText(): serial: ${sent.serial}`);

    return sent.tokens.map((token) => {
        return token.form;
    }).join(' ');
}

/**
 * Cleans up CoNNL-U content.
 * @param {String} content Content of input area
 * @return {String}     Cleaned up content
 */
function cleanConllu(content) {
    log.debug(`called cleanConllu(${content})`);

    // if we don't find any tabs, then convert >1 space to tabs
    // TODO: this should probably go somewhere else, and be more
    // robust, think about vietnamese D:
    let res = content.search('\n');
    if (res < 0)
        return content;

    // maybe someone is just trying to type conllu directly...
    res = (content.match(/_/g) || []).length;
    if (res <= 2)
        return content;

    // If we don't find any tabs, then we want to replace multiple spaces with tabs
    const spaceToTab = true;//(content.search('\t') < 0);
    const newContent = content.trim().split('\n').map((line) => {
        line = line.trim();

        // If there are no spaces and the line isn't a comment,
        // then replace more than one space with a tab
        if (line[0] !== '#' && spaceToTab)
            line = line.replace(/  */g, '\t');

        return line
    }).join('\n');

    // If there are >1 CoNLL-U format sentences is in the input, treat them as such
    // conlluMultiInput(newContent); // TODO: move this one also inside of this func, and make a separate func for calling them all at the same time

    //if (newContent !== content)
        //$('#dataText').val(newContent);

    return newContent;
}

/**
 * Takes a string in Brackets, converts it to CoNLL-U.
 * @param {String} text Input string
 * @return {String}     CoNLL-U
 */
function brackets2Conllu(text) {
    log.debug(`called brackets2Conllu(${text})`);

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
