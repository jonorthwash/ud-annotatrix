function toConllu() {
    /* Converts the input to CoNLL-U and redraws the tree */
    console.log('toConllu()');
    var newContents = getTreebank();
    if (FORMAT == "plain text") {
        plainText2Conllu(newContents);
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

    // TODO: automatical recognition of punctuation's POS
    lines = lines.concat(tokens);
    sent.serial = lines.join("\n");
    return sent.serial;
}


function plainText2Conllu(text) {
    /* Takes plain text, converts it to CoNLL-U format. */

    // if text consists of several sentences, process it as imported file
    if (text.match(/[^ ].+?[.!?](?=( |\n)[^ \n])/)) {
        CONTENTS = text;
    }
    console.log('plainText2Conllu() ' + text.length + ' // ' + text);
    
    if (CONTENTS != "") {
        var newContents = [];
        var splitted = CONTENTS.match(/[^ ].+?[.!?](?=( |$|\n))/g);
        console.log('@ ' + splitted.length);
        $.each(splitted, function(i, sentence) {
            newContents.push(plainSent2Conllu(sentence));
        })
        CONTENTS = newContents.join("\n");
        FORMAT = "CoNLL-U";
        loadDataInIndex();
    } else {

        // TODO: this probably, redundant. check.
        $("#indata").val(plainSent2Conllu(text));
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
