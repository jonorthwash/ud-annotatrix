"use strict"

function CG2conllu(CGtext) {
    /* Takes a string in CG, returns a string in conllu. */

    if (ambiguetyPresent(CGtext)) { // to abort conversion if there are ambiguous analyses
        document.getElementById("convert").disabled = true;
        $("#warning").css("background-color", "pink")
            .text("Warning: CG containing ambiguous analyses can't be converted into CoNLL-U!");
        return;
    }

    var sent = new conllu.Sentence();
    var separated = findComments(CGtext);
    sent.comments = separated[0];
    var tokens = formTokens2(CGtext);
    sent.tokens = tokens;
    console.log("result: ");
    console.log(sent.serial);
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


function ambiguetyPresent(CGtext) {
    var lines = CGtext.split(/"<(.*)>"/);

    // suppose the indent is consistent troughout the sentence
    var indent = lines[2].replace("\n", "").split(/[^\s]/)[0];
    for (var i = 2; i < lines.length; i += 2) {
        var ana = lines[i].trim(); 
        if (ana.includes(indent) && !ana.includes(indent + indent)) {
            // console.log(lines[i]);
            return true;
        }
    }
    return false;
}


function formTokens2(CGtext) {

    // i use the presupposition that there are no ambiguous readings,
    // because i've aboted conversion of ambiguous sentences in ambiguetyPresent
    var tokens = [];
    var lines = CGtext.split(/"<(.*)>"/).slice(1);
    var tokId = 1;
    $.each(lines, function(n, line) {
        if (n % 2 == 1) {
            var form = lines[n -1];
            line = line.replace(/^\n?;?( +|\t)/, "");
            if (!line.match(/(  |\t)/)) {
                var token = getAnalyses(line, {"form": form, "id": tokId});
                tokens.push(formNewToken(token));
                tokId ++;
            } else {
                var subtokens = line.trim().split("\n");
                console.log("sup: " + subtokens);
                console.log(subtokens.length);
                var supertoken = formSupertoken(subtokens, form, tokId);
                tokens.push(supertoken);
                tokId += subtokens.length;
            }
        }
    })
    return tokens;
}


function getAnalyses(line, analyses) {
    // first replace space (0020) with · for lemmas and forms containing
    // whitespace, so that the parser doesn't get confused.
    var quoted = line.replace(/.*(".*?").*/, '$1');
    var forSubst = quoted.replace(/ /g, "·");
    var gram = line.replace(/".*"/, forSubst);

    gram = gram.replace(/[\n\t]+/, "").split(" "); // then split on space and iterate
    $.each(gram, function(n, ana) { 
        if (ana.match(/"[^<>]*"/)) {
            analyses.lemma = ana.replace(/"([^<>]*)"/, '$1');
        } else if (ana.match(/#[0-9]+->[0-9]+/)) {
            analyses.head = ana.replace(/#([0-9]+)->([0-9]+)/, '$2').trim();
        } else if (ana.match(/@[a-z:]+/)) {
            analyses.deprel = ana.replace(/@([a-z:]+)/, '$1');
        } else if (n < 2) {
            analyses.upostag = ana; // TODO: what about xpostag?
        } else {
            // saving other data
            if (!analyses.feats) {
                analyses.feats = ana;
            } else {
                analyses.feats += "|" + ana;
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


function formSupertoken(subtokens, form, tokId) {
    var sup = new conllu.MultiwordToken();
    sup.form = form;

    $.each(subtokens, function(n, tok) {
        var newTok = getAnalyses(tok, {"id": tokId});
        sup.tokens.push(formNewToken(newTok));
        tokId ++;
    })
    return sup;
}