function plainText2Conllu() {
    /* Takes plain text, converts it to CoNLL-U format. */

    // if text consists of several sentences, prices it as imported file
    var text = $("#indata").val();
    if (text.match(/[^ ].+?[.!?](?=( |\n)[^ \n])/)) {
        CONTENTS = text;
    }

    if (CONTENTS != "") {
        var newContents = [];
        var splitted = CONTENTS.match(/[^ ].+?[.!?](?=( |$))/g);
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


function toConllu() {
    /* Converts the input to CoNLL-U and redraws the tree */

    if (FORMAT == "plain text") {
        plainText2Conllu();
    } else if (FORMAT == "CG3") {
        // $("#indata").val(cgParse(text));
        alert("The option is not supported yet :( ");
    }
    keyUpFunc();
}