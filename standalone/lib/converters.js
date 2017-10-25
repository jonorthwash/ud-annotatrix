function toConllu() {
    /* Converts the input to CoNLL-U and redraws the tree */
    console.log('toConllu() ' + FORMAT);
    var newContents = getTreebank();
    if (FORMAT == "plain text") {
        plainText2Conllu(newContents);
    } else if (FORMAT == "SD") {
        SD2Conllu(newContents);
    } else {
        for (var i = 0; i < RESULTS.length; ++i) {
            var currentFormat = detectFormat(RESULTS[i]);
            if (currentFormat = "CG3") {
                RESULTS[i] = CG2conllu(RESULTS[i]);
            }
        }
        showDataIndiv();
    }
    FORMAT = "CoNLL-U";
    drawTree();
}


function plainSent2Conllu(text) {
    /* Takes a plain text sentence, returns a sentence in CoNLL-U format. */

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
//       console.log(sent.tokens[i])
       if(sent.tokens[i]['form'].match(/\W/)) {
         sent.tokens[i]['upostag'] = 'PUNCT';
       }
    }

    return sent.serial;
}


function SD2Conllu(text) {
        var newContents = [];
        newContents.push(SD2conllu(text));
        CONTENTS = newContents.join("\n");
        console.log('!!!' + CONTENTS);
        FORMAT = "CoNLL-U";
        loadDataInIndex();
}

function plainText2Conllu(text) {
    /* Takes plain text, converts it to CoNLL-U format. */

    // if text consists of several sentences, process it as imported file
    if (text.match(/[^ ].+?[.!?](?=( |\n)[^ \n])/)) { // match sentence break, e.g. "blah. hargle"
        CONTENTS = text;
    }
//    console.log('plainText2Conllu() ' + text.length + ' // ' + text);
    if (CONTENTS.trim() != "") {
        var newContents = [];
        var splitted = CONTENTS.match(/[^ ].+?[.!?](?=( |$|\n))/g);
        console.log('@ ' + splitted.length);
        $.each(splitted, function(i, sentence) {
            newContents.push(plainSent2Conllu(sentence));
        })
        CONTENTS = newContents.join("\n");
        console.log('!!!' + CONTENTS);
        FORMAT = "CoNLL-U";
        loadDataInIndex();
    } else {

        // TODO: this probably, redundant. check.
        $("#indata").val(plainSent2Conllu(text));
    }
}

function conlluMultiInput(text) {
    console.log('conlluMultiInput()');
    // Takes >1 conllu sentence in the input box

    // if text consists of several sentences, process it as imported file
    if (text.match(/\n\n/)) { // match doublenewline
        CONTENTS = text;
    }
//    console.log('plainText2Conllu() ' + text.length + ' // ' + text);
    if (CONTENTS.trim() != "") {
        var newContents = [];
        var splitted = CONTENTS.split("\n\n");
        console.log('@! ' + splitted.length);
        for(var i = 0; i < splitted.length; i++) {
            newContents.push(splitted[i]);
        }
        CONTENTS = newContents.join("\n\n");
        console.log('!!!' + CONTENTS);
        FORMAT = "CoNLL-U";
        loadDataInIndex();
    }
}


function conllu2plainSent(text) {
    var sent = new conllu.Sentence();
    sent.serial = text;
    var tokens = sent.tokens.map(function(token) {
        return token.form;
    })
    var plain = tokens.join(" ");
    return plain;
}
