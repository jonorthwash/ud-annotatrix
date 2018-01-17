/**
 * Takes a plain text sentence, returns a sentence in CoNLL-U format.
 * @param {String} text Input text (sentence)
 * @return {String}     Sentence in CoNLL-U format
 */
function plainSent2Conllu(text) {
    // TODO: if there's punctuation in the middle of a sentence,
    // indices shift when drawing an arc
    // punctuation
    text = text.replace(/([^ ])([.?!;:,])/g, "$1 $2");

    var sent = new conllu.Sentence();
    var lines = ["# sent_id = _" + "\n# text = " + text]; // creating comment
    var tokens = text.split(" ");
    // enumerating tokens
    $.each(tokens, function(i, token) {tokens[i] = (i + 1) + "\t" + token});

    lines = lines.concat(tokens);
    sent.serial = lines.join("\n");
    // TODO: automatical recognition of punctuation's POS
    for(var i = 0; i < sent.tokens.length; i++) {
       if(sent.tokens[i]['form'].match(/^[!.)(»«:;?¡,"\-><]+$/)) {
//       if(sent.tokens[i]['form'].match(/\W/)) {
         sent.tokens[i]['upostag'] = 'PUNCT';
       }
       if(sent.tokens[i]['form'].match(/^[0-9]+([,.][0-9]+)*$/)) {
         sent.tokens[i]['upostag'] = 'NUM';
       }
       if(sent.tokens[i]['form'].match(/^[$%€£¥Æ§©]+$/)) {
         sent.tokens[i]['upostag'] = 'SYM';
       }
    }    

    return sent.serial;
}

/**
 * Takes a string in CG, converts it to CoNLL-U format.
 * @param {String} text Input string(CG format)
 */
function SD2Conllu(text) {
        var newContents = [];
        newContents.push(SD2conllu(text));
        CONTENTS = newContents.join("\n");
        console.log('!!!' + CONTENTS);
        FORMAT = "CoNLL-U";
        loadDataInIndex();
        showDataIndiv();
}

/**
 * Takes a plain text, converts it to CoNLL-U format.
 * @param {String} text Input text
 */
function txtCorpus2Conllu(text) {
    var corpus;
    var newContents = [];
    var splitted = text.match(/[^ ].+?[.!?](?=( |$|\n))/g);
    $.each(splitted, function(i, sentence) {
        sentence = plainSent2Conllu(sentence.trim());
        newContents.push(sentence);
    })
    corpus = newContents.join("\n");
    AVAILABLESENTENCES = splitted.length;
    return corpus;
}

/**
 * Checks if the input box has > 1 sentence.
 * @param {String} text Input text
 */
function conlluMultiInput(text) { // TOFIX: this might break after rewriting architecture. fix later.
    if(text.match(/\n\n(#.*\n)?1\t/)) {
        console.log('conlluMultiInput()');

        // if text consists of several sentences, process it as imported file
        if (text.match(/\n\n/)) { // match doublenewline
            CONTENTS = text;
        }
        if (CONTENTS.trim() != "") {
            var newContents = [];
            var splitted = CONTENTS.split("\n\n");
            //console.log('@! ' + splitted.length);
            for(var i = 0; i < splitted.length; i++) {
                newContents.push(splitted[i]);
            }
            CONTENTS = newContents.join("\n\n");
            //console.log('!!!' + CONTENTS);
            FORMAT = "CoNLL-U";
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
    var sent = new conllu.Sentence();
    sent.serial = text;
    var tokens = sent.tokens.map(function(token) {
        return token.form;
    })
    var plain = tokens.join(" ");
    return plain;
}

/**
 * Cleans up CoNNL-U content.
 * @param {String} content Content of input area
 * @return {String}     Cleaned up content
 */
function cleanConllu(content) {
    // if we don't find any tabs, then convert >1 space to tabs
    // TODO: this should probably go somewhere else, and be more
     // robust, think about vietnamese D:
    var res = content.search("\n");
    if(res < 0) {
        return content;
    }
    // maybe someone is just trying to type conllu directly...
    var res = (content.match(/_/g)||[]).length;
    if(res <= 2) {
        return content;
    }
    var res = content.search("\t");
    var spaceToTab = false;
    // If we don't find any tabs, then we want to replace multiple spaces with tabs
    if(res < 0) {
        spaceToTab = true;
    }
    // remove blank lines
    var lines = content.trim().split("\n");
    var newContent = "";
    for(var i = 0; i < lines.length; i++) {
        var newLine = lines[i].trim();
//        if(newLine.length == 0) {
//            continue;
//        }
        // If there are no spaces and the line isn't a comment, then replace more than one space with a tab
        if(newLine[0] != "#" && spaceToTab) {
            newLine = newLine.replace(/  */g, "\t");
        }
        // strip the extra tabs/spaces at the end of the line
        newContent = newContent + newLine + "\n";
    }
    return newContent;
}
