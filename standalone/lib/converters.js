/**
 * Takes a plain text sentence, returns a sentence in CoNLL-U format.
 * @param {String} text Input text (sentence)
 * @return {String}     Sentence in CoNLL-U format
 */
function plainSent2Conllu(text) {
    log.debug(`called plainSent2Conllu(${text})`);

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
function SD2Conllu(text) {
    log.debug(`called SD2Conllu(${text})`);

    CONTENTS = SD2conllu(text); // external function, see standalone/lib/SD2conllu.js
    FORMAT = 'CoNLL-U';
    log.debug(`SD2Conllu changed CONTENTS to "${CONTENTS}"`);

    loadDataInIndex();
    showDataIndiv();
}

/**
 * Takes a plain text, converts it to CoNLL-U format.
 * @param {String} text Input text
 */
function txtCorpus2Conllu(text) {
    log.debug(`called txtCorpus2Conllu(${text})`);

    const splitted = text.match(/[^ ].+?[.!?](?=( |$|\n))/g) || [text];
    AVAILABLE_SENTENCES = splitted.length;

    // corpus: convert to CoNLL-U by sentence
    return splitted.map((sentence, i) => {
        return plainSent2Conllu(sentence.trim());
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
function conllu2plainSent(text) {
    log.debug(`called conllu2plainSent(${text})`);

    let sent = new conllu.Sentence();
    sent.serial = text;

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
    return content.trim().split('\n').map((line) => {
        line = line.trim();

        // If there are no spaces and the line isn't a comment,
        // then replace more than one space with a tab
        if (line[0] !== '#' && spaceToTab)
            line = line.replace(/  */g, '\t');

        return line
    }).join('\n');
}
