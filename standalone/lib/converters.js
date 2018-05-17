/**
 * Takes a string representing some format, returns the string in
 * plain text or NULL if there was an error
 * @param {String} text Input text
 * @return {String}     Sentence in plain text format
 */
function convert2PlainText(string) {
    log.debug(`called convert2PlainText(${string})`);

    const format = detectFormat(string);

    log.debug(`convert2PlainText(): got format: ${format}`);
    switch (format) {
        case ('Unknown'):
            log.warn(`convert2PlainText(): failed to convert Unknown to plain text`);
            return null;
        case ('plain text'):
            log.warn(`convert2PlainText(): received plain text`);
            return string;
        case ('Brackets'):
            return conllu2PlainText(brackets2Conllu(string));
        case ('SD'):
            return conllu2PlainText(sd2Conllu2(string));
        case ('CoNLL-U'):
            return conllu2PlainText(string);
        case ('CG3'):
            return conllu2PlainText(cg32Conllu(string));
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
function convert2Conllu(string) {
    log.debug(`called convert2conllu(${string})`);

    const format = detectFormat(string);

    log.debug(`convert2conllu(): got format: ${format}`);
    switch (format) {
        case ('Unknown'):
            log.warn(`convert2conllu(): failed to convert Unknown to plain text`);
            return null;
        case ('plain text'):
            return plainText2Conllu(string);
        case ('Brackets'):
            return brackets2Conllu(string);
        case ('SD'):
            return sd2Conllu2(string);
        case ('CoNLL-U'):
            log.warn(`convert2conllu(): received CoNLL-U`);
            return string;
        case ('CG3'):
            return cg32Conllu(string);
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
function convert2cg3(string) {
    log.debug(`called convert2cg3(${string})`);

    const format = detectFormat(string);

    log.debug(`convert2cg3(): got format: ${format}`);
    switch (format) {
        case ('Unknown'):
            log.warn(`convert2cg3(): failed to convert Unknown to plain text`);
            return null;
        case ('plain text'):
            log.warn(`convert2cg3(): received plain text`);
            return string;
        case ('Brackets'):
            return conllu2PlainText(brackets2Conllu(string));
        case ('SD'):
            return conllu2PlainText(sd2Conllu2(string));
        case ('CoNLL-U'):
            return conllu2PlainText(string);
        case ('CG3'):
            return conllu2PlainText(cg32Conllu(string));
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
    log.debug('detected format:',detectFormat(text));

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
            console.log('token', token);
            return `${i+1}\t${token}`; // enumerating tokens
        }) );
    sent.serial = lines.join('\n');

    console.log('lines', lines);
    console.log('serial', sent.serial);

    // TODO: automatical recognition of punctuation's POS ==> done?
    $.each(sent.tokens, (i, token) => {
        console.log(token);
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

        if (CONTENTS.trim() !== '') { // NOTE: removed some code that didn't do anything :)
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
    sent.serial = text;
    console.log(sent.tokens);
    console.log(sent.serial);

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
    const spaceToTab = (content.search('\t') < 0);
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

    if (newContent !== content)
        $('#indata').val(newContent);

    return newContent;
}
