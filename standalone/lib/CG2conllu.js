"use strict"

function CG2conllu(CGtext) {
    /* Takes a string in CG, returns a string in conllu. */
    var sent = new conllu.Sentence();
    // console.log(CGtext);
    var separated = findComments(CGtext);
    sent.comments = separated[0];

    var tokens = formTokens(separated[1]);
    sent.tokens = tokens;

    return sent.serial;
}


function findComments(CGtext) {
    /* Takes a string in CG, returns 2 arrays with strings. */
    var lines = CGtext.split("\n");
    var comments = [];
    var tokens = [];
    $.each(lines, function(n, line) {
        if (line[0] == "#") {
            comments.push(line);
        } else {
            tokens.push(line);
        }
    });
    return [comments, tokens];
}


function formTokens(lines) {
    var tokens = [];
    for (var i = 0; i < (lines.length); i += 2) {
        if (lines[i].match(/"<.*>"/)) { // then everything is ok
            var analyses = {};
            analyses.id = i/2 + 1;
            analyses.form = lines[i].replace(/"<(.*)>"/, '$1');

            if (lines[i + 1] && !lines[i + 1].match(/"<.*>"/)) { // then everything is ok
                analyses = getAnalyses(lines[i + 1], analyses); 
            } else { // TODO: raise an exception
                console.log("Something gone wrong on line: " + lines[i + 1]);
            }
            tokens.push(formNewToken(analyses));
        } else { // TODO: raise an exception
            console.log("Something gone wrong on line: " + lines[i]);
        }
    }
    return tokens;
}


function getAnalyses(line, analyses) {
    // first replace space (0020) with · for lemmas and forms containing
    // whitespace, so that the parser doesn't get confused.
    var quoted = line.replace(/.*(".*?").*/, '$1');
    var forSubst = quoted.replace(/ /g, "·");
    var gram = line.replace(/".*"/, forSubst);

    gram = gram.trim(" ").split(" "); // then split on space and iterate
    $.each(gram, function(n, ana) { 
        if (ana.match(/"[^<>]*"/)) {
            analyses.lemma = ana.replace(/"([^<>]*)"/, '$1');
        } else if (ana.match(/#[0-9]+->[0-9]+/)) {
            analyses.head = ana.replace(/#([0-9]+)->([0-9]+)/, '$2');
        } else if (ana.match(/@[a-z:]+/)) {
            analyses.deprel = ana.replace(/@([a-z:]+)/, '$1');
        } else if (n < 2) {
            analyses.upostag = ana; // TODO: what about xpostag?
        } else {
            // saving other data
            if (!analyses.feats) {
                analyses.feats = ana;
            } else {
                analyses.feats += "." + ana;
            }
        }
    })

    return analyses;
}


function formNewToken(attrs) {
    /* Takes a dictionary of attributes. Creates a new token, assigns
    values to the attributes given. Returns the new token. */

    var newToken = new conllu.Token();
    $.each(attrs, function(attr, val){
        newToken[attr] = val;
    });
    return newToken;
}
